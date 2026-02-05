import { HCEntry } from "../types";

export const canBeACommander = (card: HCEntry) => {
  return (
    ((card["Supertype(s)"]?.[0]?.includes("Legendary") &&
      card["Card Type(s)"][0]?.includes("Creature")) ||
      card["Text Box"]?.[0]?.includes("can be your commander")) &&
    !card["Text Box"]?.[0]?.includes("Irresponsible")
  );
};
