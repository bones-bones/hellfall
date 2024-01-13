import { atom } from "jotai";
import { TheDraft } from "./types";

export const draftAtom = atom<TheDraft | undefined>(undefined);
