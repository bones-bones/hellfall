import { sheetsKey } from '../../keys';
import { HCEntry } from './types';

export const fetchDatabase = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;
  const [_garbage, keys, ...rest] = asJson.values as any[];

  const theThing = rest.map(entry => {
    const cardObject: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (cardObject[keys[i]] !== undefined) {
        if (!Array.isArray(cardObject[keys[i]])) {
          cardObject[keys[i]] = [cardObject[keys[i]]];
        }
        cardObject[keys[i]].push(entry[i]);
      } else {
        cardObject[keys[i]] = entry[i];
      }
      if (keys[i] == 'CMC') {
        cardObject[keys[i]] = parseInt(cardObject[keys[i]]);
      }
    }
    return cardObject as HCEntry;
  });

  return theThing; //.filter((e) => e.Set != "C");
};
