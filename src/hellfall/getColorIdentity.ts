import { HCEntry } from '../types';
import { pipsAtom } from './pipsAtom';
import { useAtomValue } from 'jotai';
import { getDefaultStore } from 'jotai';
import { HCColor, HCColors } from '../types/Card';
const store = getDefaultStore();

export const getColorIdentity = (card: HCEntry) => {
  const colorIdentity = new Set<string[]>();
  const pips = store.get(pipsAtom);
  // TODO: make color indicators work
  // TODO: special cases for Crypticspire Mantis (must be at least 2), Draft Dodger (Canada = Red and White)
  card.Cost?.forEach(entry => {
    const names = (entry || '').match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    names?.forEach((name) => {
      const pip = pips?.find((e) => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors as string[]);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });
  });

  card['Text Box']?.forEach(entry => {
    const minusReminderText = (entry || '').replaceAll(/\(.*?\)/g, '');
    const names = (minusReminderText || '').match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    names?.forEach((name) => {
      const pip = pips?.find((e) => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors as string[]);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });
  });

  card['Subtype(s)']?.forEach(entry => {
    const splitSubtypes = (entry || '').split(';');
    splitSubtypes.forEach(typeEntry => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add([mappedColor] as HCColors);
      }
    });
  });
  return Array.from(colorIdentity);
};

const manaSymbolColorMatching: Record<
  string,
  | "White"
  | "Black"
  | "Red"
  | "Blue"
  | "Green"
  | "Purple"
  | "Pickle"
  | "Yellow"
  | "Brown"
  | "Pink"
  | "Teal"
  | "Orange"
> = {
};

const landToColorMapping = {
  Plains: 'W',
  Ploons: 'W',
  Swamp: 'B',
  Island: 'U',
  // IslandGX: 'Blue', // TODO: I have sinned
  Mountain: 'R',
  Moontain: 'R',
  Forest: 'G',
  Nebula: 'P',
} as Record<string, HCColor>;
//"{3/P}{U}",
