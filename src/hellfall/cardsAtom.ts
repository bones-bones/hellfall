import { HCEntry } from "../types";
import { atom } from "jotai";

// @ts-ignore
export const cardsAtom = atom<HCEntry[]>(async () => {
  const { data } = await import("../data/Hellscube-Database.json");
  return data as HCEntry[];
});
