import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
type CardAtomic = {
  faceName?: string;
};


/**
 * Extracts ALL card names that Cockatrice would create as separate entries
 * - Normal cards: one entry per card
 * - DFCs/modal cards: separate entry for EACH face
 */
const extractCockatriceCardNames = (cardsData: Record<string, CardAtomic[]>, tokensData:string): Set<string> => {
  const names = new Set<string>();
  Object.entries(cardsData).forEach(([name, faces]) => {
    names.add(name.toLowerCase());
    if (faces.length > 1) {
      faces.filter(face => face.faceName).forEach(face => names.add(face.faceName!.toLowerCase()));
    }
  });
  console.log('card names added')
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '_',
    parseAttributeValue: true,
    trimValues: true
  })
  const tokenDB = parser.parse(tokensData)['cockatrice_carddatabase']?.cards?.card;
  tokenDB?.forEach((card:any) => names.add(card.name.toLowerCase()))
  console.log('token names added')
  return names;
};

/**
 * Fetches and parses MTGJSON AtomicCards data
 * @returns Set of all card names as Cockatrice expects them
 */
export const fetchAllCardNames = async (): Promise<Set<string>> => {
  const requestedData = await fetch('https://mtgjson.com/api/v5/AtomicCards.json');
  const asJson = (await requestedData.json()) as any;
  console.log('cards fetched')
  const response = await fetch('https://raw.githubusercontent.com/Cockatrice/Magic-Token/master/tokens.xml');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const xmlString = await response.text();
  console.log('tokens fetched')
  const cardNames = extractCockatriceCardNames(asJson.data, xmlString);
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
