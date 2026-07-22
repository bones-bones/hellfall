import { randomUUID } from 'node:crypto';
import { publishCatalogSnapshot, type CatalogPublishResult } from './publishCatalog.ts';

export type CatalogSyncJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type CatalogSyncJob = {
  id: string;
  status: CatalogSyncJobStatus;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  result?: CatalogPublishResult;
  error?: string;
};

type InternalJob = CatalogSyncJob & {
  promise?: Promise<void>;
};

const jobs = new Map<string, InternalJob>();
const MAX_JOBS = 20;

function trimJobs(): void {
  if (jobs.size <= MAX_JOBS) return;
  const ordered = [...jobs.values()].sort((a, b) => a.createdAt - b.createdAt);
  for (const job of ordered) {
    if (jobs.size <= MAX_JOBS) break;
    if (job.status === 'running') continue;
    jobs.delete(job.id);
  }
}

export function createCatalogSyncJob(): CatalogSyncJob {
  trimJobs();
  const job: InternalJob = {
    id: randomUUID(),
    status: 'queued',
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  return publicJob(job);
}

export function getCatalogSyncJob(jobId: string): CatalogSyncJob | null {
  const job = jobs.get(jobId);
  return job ? publicJob(job) : null;
}

function publicJob(job: InternalJob): CatalogSyncJob {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    result: job.result,
    error: job.error,
  };
}

/**
 * Run (or join) a catalog sync job. Safe across instances: unknown jobIds still
 * publish — in-memory status is best-effort on the instance that runs the work.
 */
export async function runCatalogSyncJob(jobId: string): Promise<CatalogSyncJob> {
  let job = jobs.get(jobId);
  if (!job) {
    job = {
      id: jobId,
      status: 'queued',
      createdAt: Date.now(),
    };
    jobs.set(jobId, job);
  }

  if (job.status === 'completed' || job.status === 'failed') {
    return publicJob(job);
  }

  if (!job.promise) {
    job.status = 'running';
    job.startedAt = Date.now();
    job.promise = publishCatalogSnapshot()
      .then(result => {
        job!.status = 'completed';
        job!.result = result;
        job!.finishedAt = Date.now();
      })
      .catch(err => {
        job!.status = 'failed';
        job!.error = err instanceof Error ? err.message : String(err);
        job!.finishedAt = Date.now();
        console.error('[catalog/sync] job failed', jobId, err);
      });
  }

  await job.promise;
  return publicJob(job);
}
