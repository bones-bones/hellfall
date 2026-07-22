import { withCors, HandlerRequest, HandlerResponse } from './lib';
import { requireCatalogSyncAuth } from './lib/requireCatalogSyncAuth.ts';
import {
  createCatalogSyncJob,
  getCatalogSyncJob,
  runCatalogSyncJob,
} from '../lib/catalogSyncJob.ts';

function sendJson(res: HandlerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/** POST /api/admin/catalog/sync — accept a sync job (202). Does not publish yet. */
export const catalogSyncHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  const auth = await requireCatalogSyncAuth(req, res);
  if (!auth) return;

  const job = createCatalogSyncJob();
  // 202: client should POST /api/admin/catalog/sync/:jobId/run (keeps a request
  // open so Cloud Run still allocates CPU without always-on / larger instances).
  sendJson(res, 202, {
    ok: true,
    accepted: true,
    jobId: job.id,
    status: job.status,
    runPath: `/api/admin/catalog/sync/${job.id}/run`,
    statusPath: `/api/admin/catalog/sync/${job.id}`,
  });
};

/** GET /api/admin/catalog/sync/:jobId — job status (no side effects). */
export const catalogSyncStatusHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  jobId: string
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const auth = await requireCatalogSyncAuth(req, res);
  if (!auth) return;

  const job = getCatalogSyncJob(jobId);
  if (!job) {
    sendJson(res, 404, { ok: false, reason: 'job_not_found', jobId });
    return;
  }
  sendJson(res, 200, { ok: true, ...job });
};

/**
 * POST /api/admin/catalog/sync/:jobId/run — perform the publish while this
 * request stays open (CPU allocated on request-based Cloud Run).
 */
export const catalogSyncRunHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  jobId: string
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  const auth = await requireCatalogSyncAuth(req, res);
  if (!auth) return;

  try {
    const job = await runCatalogSyncJob(jobId);
    if (job.status === 'failed') {
      sendJson(res, 500, {
        ok: false,
        reason: 'sync_failed',
        jobId: job.id,
        status: job.status,
        message: job.error,
      });
      return;
    }
    sendJson(res, 200, {
      ok: true,
      jobId: job.id,
      status: job.status,
      ...job.result,
    });
  } catch (err) {
    console.error('catalogSyncRunHandler', err);
    const message = err instanceof Error ? err.message : String(err);
    sendJson(res, 500, { ok: false, reason: 'sync_failed', jobId, message });
  }
};
