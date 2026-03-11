import { Firestore } from "@google-cloud/firestore";
import { withCors } from "./lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";
import { requireTagAuth } from "./lib/requireTagAuth.js";

const db = new Firestore();
const collection = db.collection("card_tags");

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf-8");
  return body ? JSON.parse(body) : {};
}

export type CardTagOverrides = { added: string[]; removed: string[] };

function normalizeTag(t: string): string {
  return t.trim();
}

export const cardTagsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string,
  tagFromPath: string | null
): Promise<void> => {
  const headers = withCors({ "Content-Type": "application/json" }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!cardId || cardId.length > 200) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: "invalid_card_id" }));
    return;
  }

  const auth = await requireTagAuth(req, res);
  if (!auth) return;

  const docRef = collection.doc(cardId);

  if (req.method === "GET") {
    const snap = await docRef.get();
    const data = snap.data() as CardTagOverrides | undefined;
    const added = Array.isArray(data?.added) ? data.added : [];
    const removed = Array.isArray(data?.removed) ? data.removed : [];
    res.statusCode = 200;
    res.end(JSON.stringify({ added, removed }));
    return;
  }

  if (req.method === "POST") {
    const body = (await readJsonBody(req)) as { tag?: string };
    const tag = body.tag != null ? String(body.tag) : "";
    const norm = normalizeTag(tag);
    if (!norm) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: "tag_required" }));
      return;
    }
    const snap = await docRef.get();
    const data = snap.data() as CardTagOverrides | undefined;
    const added = Array.isArray(data?.added) ? [...data.added] : [];
    const removed = Array.isArray(data?.removed) ? [...data.removed] : [];
    if (removed.includes(norm)) {
      removed.splice(removed.indexOf(norm), 1);
    } else if (!added.includes(norm)) {
      added.push(norm);
    }
    await docRef.set({ added, removed });
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, added, removed }));
    return;
  }

  if (req.method === "DELETE") {
    const tag = tagFromPath != null ? decodeURIComponent(tagFromPath) : "";
    const norm = normalizeTag(tag);
    if (!norm) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: "tag_required" }));
      return;
    }
    const snap = await docRef.get();
    const data = snap.data() as CardTagOverrides | undefined;
    let added = Array.isArray(data?.added) ? [...data.added] : [];
    let removed = Array.isArray(data?.removed) ? [...data.removed] : [];
    if (added.includes(norm)) {
      added = added.filter(t => t !== norm);
    } else {
      removed.push(norm);
    }
    await docRef.set({ added, removed });
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, added, removed }));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, POST, DELETE");
  res.end();
};
