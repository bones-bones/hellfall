import { Pip } from "../types";
import { atom } from "jotai";

export const pipsAtom = atom<Pip[]>([]);

export const loadPips = async () => {
  const { data } = await import("../data/pips.json");
  return data as Pip[];
};
