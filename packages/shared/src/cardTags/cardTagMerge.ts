// /**
//  * Tag merge helpers for Firestore card docs.
//  * `baseTags` = canonical tags from the last JSON migrate; `added` / `removed` = contributor overrides.
//  * `tags` = merge(baseTags, overrides), kept in sync on every write.
//  */

// export type CardTagOverrides = { added: string[]; removed: string[] };

// export type CardTagState = CardTagOverrides & {
//   baseTags: string[];
//   tags: string[];
// };

// export function normalizeTag(t: string): string {
//   return t.trim();
// }

// export function normalizeTagList(tags: unknown): string[] {
//   if (!Array.isArray(tags)) return [];
//   return tags.map(String).map(normalizeTag).filter(Boolean);
// }

// export function mergeTags(baseTags: string[], overrides: CardTagOverrides): string[] {
//   const removedSet = new Set(overrides.removed.map(normalizeTag));
//   const added = overrides.added.map(normalizeTag).filter(t => t && !removedSet.has(t));
//   return baseTags
//     .map(normalizeTag)
//     .filter(t => t && !removedSet.has(t))
//     .concat(added);
// }

// export function dedupeOrdered(tags: string[]): string[] {
//   const seen = new Set<string>();
//   const out: string[] = [];
//   for (const t of tags) {
//     const n = normalizeTag(t);
//     if (!n || seen.has(n)) continue;
//     seen.add(n);
//     out.push(n);
//   }
//   return out;
// }

// /** Recover base tags from merged `tags` + overrides when `baseTags` was not stored yet. */
// export function inferBaseTags(storedTags: string[], overrides: CardTagOverrides): string[] {
//   const { added, removed } = overrides;
//   const base: string[] = [];
//   for (const t of storedTags) {
//     if (!added.includes(t)) base.push(t);
//   }
//   for (const t of removed) {
//     if (!base.includes(t)) base.push(t);
//   }
//   return dedupeOrdered(base);
// }

// export function resolveTagState(data: Record<string, unknown> | undefined): CardTagState {
//   const added = normalizeTagList(data?.added);
//   const removed = normalizeTagList(data?.removed);
//   const overrides: CardTagOverrides = { added, removed };

//   let baseTags: string[];
//   if (data != null && 'baseTags' in data) {
//     baseTags = normalizeTagList(data.baseTags);
//   } else {
//     const storedTags = normalizeTagList(data?.tags);
//     baseTags =
//       added.length === 0 && removed.length === 0
//         ? storedTags
//         : inferBaseTags(storedTags, overrides);
//   }

//   const tags = dedupeOrdered(mergeTags(baseTags, overrides));
//   return { baseTags, added, removed, tags };
// }

// export function applyAddTag(state: CardTagState, tag: string): CardTagState {
//   const norm = normalizeTag(tag);
//   if (!norm) return state;

//   const removed = [...state.removed];
//   const added = [...state.added];
//   const removedIdx = removed.indexOf(norm);
//   if (removedIdx >= 0) {
//     removed.splice(removedIdx, 1);
//   } else if (!added.includes(norm)) {
//     added.push(norm);
//   }

//   const overrides: CardTagOverrides = { added, removed };
//   return {
//     baseTags: state.baseTags,
//     added,
//     removed,
//     tags: dedupeOrdered(mergeTags(state.baseTags, overrides)),
//   };
// }

// export function applyRemoveTag(state: CardTagState, tag: string): CardTagState {
//   const norm = normalizeTag(tag);
//   if (!norm) return state;

//   let added = [...state.added];
//   const removed = [...state.removed];
//   if (added.includes(norm)) {
//     added = added.filter(t => t !== norm);
//   } else if (!removed.includes(norm)) {
//     removed.push(norm);
//   }

//   const overrides: CardTagOverrides = { added, removed };
//   return {
//     baseTags: state.baseTags,
//     added,
//     removed,
//     tags: dedupeOrdered(mergeTags(state.baseTags, overrides)),
//   };
// }

// export function tagFieldsForWrite(state: CardTagState): {
//   baseTags: string[];
//   added: string[];
//   removed: string[];
//   tags: string[];
// } {
//   return {
//     baseTags: state.baseTags,
//     added: state.added,
//     removed: state.removed,
//     tags: state.tags,
//   };
// }
