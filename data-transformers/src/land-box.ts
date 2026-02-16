import { sheetsKey } from '../../keys';
import fs from 'fs';
const fetchLandBox = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1SCimlp656sQeRXudjcbC6xlqyLQoZcPl0rZKJ9J_CZc/values/Lands?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [keys, ...rest] = asJson.values as any[];

  console.log(rest);
  const theThing = rest.map(entry => {
    const ob: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (ob[keys[i]] !== undefined) {
        if (!Array.isArray(ob[keys[i]])) {
          ob[keys[i]] = [ob[keys[i]]];
        }
        ob[keys[i]].push(entry[i]);
      } else {
        // @ts-ignore
        ob[keys[i]] = entry[i];
      }
    }
    return ob;
  });

  console.log(theThing);
  return theThing;
};

fetchLandBox().then(lands => {
  fs.writeFileSync(
    './src/data/lands.json',
    JSON.stringify(
      {
        data: lands.sort((a, b) => {
          if (a.Type > b.Type) {
            if (a.Set > b.Set) {
              return 1;
            }
            return -1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );
});
