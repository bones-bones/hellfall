import { sheetsKey } from "../../keys";
import { HCEntry } from "./types";
import fs from "fs";

export const fetchDatabase = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1RY8yiuL2cZkQyMMjpGWZleoBs21_zrRbvWxxyMNplOA/values/Database?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_trash, _garbage, keys, ...rest] = asJson.values as any[];

  const theThing = rest.map((entry) => {
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
      if (keys[i] == "CMC") {
        ob[keys[i]] = parseInt(ob[keys[i]]);
      }
    }
    return ob;
  });

  // const requestedtext = await fetch(
  //   `https://sheets.googleapis.com/v4/spreadsheets/1RY8yiuL2cZkQyMMjpGWZleoBs21_zrRbvWxxyMNplOA/values/Database?key=${sheetsKey}`
  // );

  // fs.writeFileSync(
  //   "./src/data/Hellscube-Database.csv",

  //   await requestedtext.text()
  // );

  return theThing as HCEntry[];
};
