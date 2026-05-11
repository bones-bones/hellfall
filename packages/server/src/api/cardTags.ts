import { Firestore, type DocumentReference, type DocumentSnapshot } from "@google-cloud/firestore";
import { withCors } from "./lib/cors.js";
import { env } from "./lib/env.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";
import { requireTagAuth } from "./lib/requireTagAuth.js";

const db = new Firestore({ databaseId: env.FIRESTORE_HELLSCUBE_DATABASE_ID });
const collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

/** If `cards/{id}` is missing, create it with empty tag overrides (merge-safe). Returns latest snapshot. */
async function getOrSeedCardTagsDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  let snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({ added: [], removed: [] }, { merge: true });
    snap = await docRef.get();
  }
  return snap;
}


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

  try {
    if (!cardId || cardId.length > 200) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: "invalid_card_id" }));
      return;
    }

    const docRef = collection.doc(cardId);

    if (req.method === "GET") {
      const snap = await getOrSeedCardTagsDoc(docRef);
      const data = snap.data() as CardTagOverrides | undefined;
      const added = Array.isArray(data?.added) ? data.added.map(String) : [];
      const removed = Array.isArray(data?.removed) ? data.removed.map(String) : [];
      const payload = { added, removed, persistEnabled: true as const };
      let body: string;
      try {
        body = JSON.stringify(payload);
      } catch {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, reason: "invalid_stored_data" }));
        return;
      }
      res.statusCode = 200;
      res.end(body);
      return;
    }

    const auth = await requireTagAuth(req, res);
    if (!auth) return;

    if (req.method === "POST") {
      let body: { tag?: string };
      try {
        body = (await readJsonBody(req)) as { tag?: string };
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: "invalid_json" }));
        return;
      }
      const tag = body.tag != null ? String(body.tag) : "";
      const norm = normalizeTag(tag);
      if (!norm) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: "tag_required" }));
        return;
      }
      const snap = await getOrSeedCardTagsDoc(docRef);
      const data = snap.data() as CardTagOverrides | undefined;
      const added = Array.isArray(data?.added) ? [...data.added.map(String)] : [];
      const removed = Array.isArray(data?.removed) ? [...data.removed.map(String)] : [];
      if (removed.includes(norm)) {
        removed.splice(removed.indexOf(norm), 1);
      } else if (!added.includes(norm)) {
        added.push(norm);
      }
      await docRef.set({ added, removed }, { merge: true });
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
      const snap = await getOrSeedCardTagsDoc(docRef);
      const data = snap.data() as CardTagOverrides | undefined;
      let added = Array.isArray(data?.added) ? [...data.added.map(String)] : [];
      let removed = Array.isArray(data?.removed) ? [...data.removed.map(String)] : [];
      if (added.includes(norm)) {
        added = added.filter(t => t !== norm);
      } else {
        removed.push(norm);
      }
      await docRef.set({ added, removed }, { merge: true });
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, added, removed }));
      return;
    }

    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    res.end();
  } catch (err) {
    console.error("cardTagsHandler", err);

    if (res.writableEnded) return;
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: "server_error" }));
  }
};
