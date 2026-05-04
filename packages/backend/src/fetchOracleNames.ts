import fs from 'fs';

type CardAtomic = {
  faceName?: string; // Used in some AtomicCard layouts
};

/**
 * Extracts ALL card names that Cockatrice would create as separate entries
 * - Normal cards: one entry per card
 * - DFCs/modal cards: separate entry for EACH face
 */
const extractCockatriceCardNames = (cardsData: Record<string, CardAtomic[]>): Set<string> => {
  const names = new Set<string>();
  Object.entries(cardsData).forEach(([name, faces]) => {
    names.add(name);
    if (faces.length > 1) {
      faces.filter(face => face.faceName).forEach(face => names.add(face.faceName!));
    }
  });
  return names;
};

/**
 * Fetches and parses MTGJSON AtomicCards data
 * @returns Set of all card names as Cockatrice expects them
 */
export const fetchAllCardNames = async (): Promise<Set<string>> => {
  const requestedData = await fetch('https://mtgjson.com/api/v5/AtomicCards.json');
  const asJson = (await requestedData.json()) as any;
  const cardNames = extractCockatriceCardNames(asJson.data);
  return cardNames;
};

const main = async () => {
  console.log('Fetching MTGJSON data');
  const cardNames = await fetchAllCardNames();
  console.log('Successfully fetched MTGJSON');

  fs.writeFileSync(
    '../shared/src/data/oracle-names.json',
    JSON.stringify(
      {
        data: Array.from(cardNames),
      },
      null,
      '\t'
    )
  );
};

main();
