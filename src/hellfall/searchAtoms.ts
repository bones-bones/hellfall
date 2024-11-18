import { atom } from "jotai";
const searchParams = new URLSearchParams(document.location.search);

export const nameSearchAtom = atom<string>(searchParams.get("name") || "");

export const activeCardAtom = atom<string>(
  searchParams.get("activeCard") || ""
);

export const rulesSearchAtom = atom<string[]>(
  searchParams.get("rules")?.split(",") || []
);
export const legalityAtom = atom<"legal" | "banned" | "">(
  (searchParams.get("legality") as "legal" | "banned" | "") || ""
);

export const typeSearchAtom = atom<string[]>(
  searchParams.get("type")?.split(",") || []
);
export const searchSetAtom = atom(searchParams.get("set")?.split(",") || []);

export const isCommanderAtom = atom(searchParams.get("isCommander") == "true");

export const searchColorsAtom = atom(
  searchParams.get("colors")?.split(",") || []
);

export const searchColorsIdentityAtom = atom(
  searchParams.get("colorIdentity")?.split(",") || []
);

export const searchColorComparisonAtom = atom(
  (searchParams.get("colorComparison") || "=") as "<=" | ">=" | "="
);

export const powerAtom = atom<
  { value: number; operator: "<" | "=" | ">" } | undefined
>(
  (() => {
    const parms = searchParams.get("p");

    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as "<" | "=" | ">",
      };
    }
    return undefined;
  })()
);

export const toughnessAtom = atom<
  { value: number; operator: "<" | "=" | ">" } | undefined
>(
  (() => {
    const parms = searchParams.get("t");
    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as "<" | "=" | ">",
      };
    }
    return undefined;
  })()
);

export const basedHybridRule = atom(
  (searchParams.get("hybridRule") || "") as "based"
);

export const searchCmcAtom = atom<
  | {
      operator: ">" | "<" | "=" | "";
      value: number;
    }
  | undefined
>(
  searchParams.get("manaValue")
    ? JSON.parse(searchParams.get("manaValue")!)
    : undefined
);

export const sortAtom = atom<"Alpha" | "CMC" | "Color">("Color");
export const offsetAtom = atom(parseInt(searchParams.get("page") || "0") || 0);
export const creatorsAtom = atom(
  searchParams.get("creator")?.split(",,") || []
);
export const tagsAtom = atom(searchParams.get("tags")?.split(",") || []);

export const extraFiltersAtom = atom(
  searchParams.get("extraFilters")?.split(",") || []
);
