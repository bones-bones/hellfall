import { Firestore } from "@google-cloud/firestore";
import { withCors } from "./lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";

const db = new Firestore({ databaseId: "watch-wolf-war" });
const docRef = db.collection("cards");

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  // @ts-ignore
  const body = Buffer.concat(chunks).toString("utf-8");
  return body ? JSON.parse(body) : {};
}

export const watchwolfHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  const headers = withCors({ "Content-Type": "application/json" }, req);
  Object.assign(headers, { "Cache-Control": "public, max-age=86400" });
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET") {
    const snapshot = await docRef.get();
    const data = snapshot.docs.map((d) => d.data());
    res.statusCode = 200;
    res.end(JSON.stringify({ data }));
    return;
  }

  if (req.method === "POST") {
    const body = (await readJsonBody(req)) as { WinId?: string; LoseId?: string };
    const winId = body.WinId;
    const loseId = body.LoseId;

    if (!winId || !loseId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "WinId and LoseId required" }));
      return;
    }

    const [winSnap, loseSnap] = await Promise.all([
      docRef.doc(winId).get(),
      docRef.doc(loseId).get(),
    ]);
    const winResult = winSnap.data();
    const loseResult = loseSnap.data();

    await Promise.all([
      docRef.doc(winId).set({
        Id: winId,
        Wins: (winResult?.Wins ?? 0) + 1,
        Matches: (winResult?.Matches ?? 0) + 1,
      }),
      docRef.doc(loseId).set({
        Id: loseId,
        Wins: loseResult?.Wins ?? 0,
        Matches: (loseResult?.Matches ?? 0) + 1,
      }),
    ]);

    res.statusCode = 200;
    res.end(JSON.stringify({ winId, loseId }));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, POST");
  res.end();
};
