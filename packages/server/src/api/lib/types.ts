import type { IncomingMessage, ServerResponse } from 'node:http';

export interface HandlerRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

export type HandlerResponse = ServerResponse;
