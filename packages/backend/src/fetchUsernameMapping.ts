import { sheetsKey } from './env.ts';

export const fetchUsernameMappings = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Username+Mappings?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_keys, ...rest] = asJson.values as string[][];

  const mappings: Record<string, string> = {};
  rest.forEach(entry => {
    entry[1].split(';').forEach(alt => {
      mappings[alt] = entry[0];
    });
  });
  return mappings;
};
