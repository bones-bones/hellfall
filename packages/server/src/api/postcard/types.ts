import { HCKind } from '@hellfall/shared/types';
import { firestoreCard } from '@hellfall/shared/utils/firestore';

export type PostcardKind = Extract<HCKind, 'card' | 'token'>;

export type PostcardBody = {
  name?: string;
  image?: string;
  imageBase64?: string;
  /** From mork; used with imageBase64 so GCS objects are not always `.png`. */
  imageMimeType?: string;
  creators?: string;
  set?: string;
  /** Legacy HC id. Optional on ingest — hellfall mints one when omitted and returns it. */
  hcid?: string;
  /** Hellfall print UUID (sheet BB). Used for GCS image keys; never use hcid for that. */
  id?: string;
  kind?: PostcardKind;
};

export type RollbackBody = {
  docId?: string;
  wasCreate?: boolean;
  previous?: firestoreCard | null;
};
