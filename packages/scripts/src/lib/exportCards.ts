import { Firestore, type Timestamp } from '@google-cloud/firestore';

export type HellscubeExportCard = Record<string, unknown> & { _docId: string };

export type HellscubeExportPayload = {
  exportedAt: string;
  databaseId: string;
  collection: string;
  data: HellscubeExportCard[];
};

export type HellscubeExportOptions = {
  databaseId?: string;
  collectionName?: string;
};

function serializeValue(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const ts = value as Timestamp;
    if (typeof ts.toDate === 'function') {
      return ts.toDate().toISOString();
    }
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeValue(v);
    }
    return out;
  }
  return value;
}

function docToExportRow(docId: string, data: Record<string, unknown>): HellscubeExportCard {
  const serialized = serializeValue(data) as Record<string, unknown>;
  return { _docId: docId, ...serialized };
}

/** Export all documents from the Hellscube cards collection as stored in Firestore. */
export async function exportHellscubeCards(
  options: HellscubeExportOptions = {}
): Promise<HellscubeExportPayload> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName =
    options.collectionName?.trim() || process.env.FIRESTORE_CARDS_COLLECTION?.trim() || 'cards';

  const db = new Firestore({ databaseId });
  const snapshot = await db.collection(collectionName).get();

  const data = snapshot.docs.map(doc =>
    docToExportRow(doc.id, doc.data() as Record<string, unknown>)
  );

  return {
    exportedAt: new Date().toISOString(),
    databaseId,
    collection: collectionName,
    data,
  };
}
