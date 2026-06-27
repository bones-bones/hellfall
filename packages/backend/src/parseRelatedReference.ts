/** Strip optional set prefix from sheet references, e.g. "HCV: Whale Visions" -> "Whale Visions" */
// export const stripSheetReferencePrefix = (name: string): string =>
//   name.replace(/^[A-Z][A-Z0-9.]*:\s*/, '');

export const parseRelatedReferenceName = (oldName: string): { name: string; count?: string } => {
  const match = oldName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
  const name = /* stripSheetReferencePrefix */(match?.groups?.name ?? oldName);
  const count = match?.groups?.count;
  return { name, count };
};
