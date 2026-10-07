import { HandlerResponse } from '../lib/index.ts';

export function clientErrorReason(err: unknown): string {
  return err instanceof Error ? err.message : 'postcard_failed';
}

export function isClientError(err: unknown): boolean {
  if (err instanceof SyntaxError) return true;
  const reason = clientErrorReason(err);
  return reason === 'invalid_body' || reason === 'image_gcs_not_configured';
}

export function respondPostcardError(
  err: unknown,
  res: HandlerResponse,
  context: Record<string, unknown>
): void {
  const reason = clientErrorReason(err);
  const status = isClientError(err) ? 400 : 500;
  const log = status >= 500 ? console.error : console.warn;
  log.call(console, '[postcard] failed', { ...context, status, reason }, err);
  res.statusCode = status;
  res.end(JSON.stringify({ ok: false, reason }));
}
