import { sheetsKey } from "../../keys";

export const fetchUsernameMappings = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1RY8yiuL2cZkQyMMjpGWZleoBs21_zrRbvWxxyMNplOA/values/Username+Mappings?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [keys, ...rest] = asJson.values as any[];

  const theThing = rest.map((entry) => {
    const ob = {};
    for (let i = 0; i < keys.length; i++) {
      // @ts-ignore
      ob[keys[i]] = entry[i];
    }
    return ob;
  });
  return theThing.reduce<Record<string, string[]>>((curr, next) => {
    //@ts-ignore
    curr[next["Chosen Name"]] = next["; seperated alts"].split(";");
    return curr;
  }, {});
};
