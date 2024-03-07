import { atom } from "jotai";
import { TheDraft } from "./types";
import { HCEntry } from "../types";

export const draftAtom = atom<TheDraft | undefined>(undefined);

export const deckAtom = atom<HCEntry[]>([]);
