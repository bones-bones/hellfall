import { HCEntry } from '../types';

const MANA_ICON_REGEX = /\{.+?\}/g;

function addManaIconsFromText(
  text: string,
  colorIdentity: Set<string | string[]>,
  stripReminderText = false
) {
  const source = stripReminderText ? text.replaceAll(/\(.*?\)/g, '') : text;
  const icons = source.match(MANA_ICON_REGEX);
  icons?.forEach(icon => {
    const iconArray = icon.replaceAll(/[{}]/g, '').split('/');
    const nResp = iconArray.map(e => manaSymbolColorMatching[e] ?? 'Colorless'); // TODO: the first char cause skeleton
    if (nResp) {
      //@ts-ignore
      colorIdentity.add(nResp);
    }
  });
}

export const getColorIdentity = (card: HCEntry) => {
  const colorIdentity = new Set<string | string[]>();

  // TODO: make color indicators work
  // TODO: special cases for Crypticspire Mantis (must be at least 2), Draft Dodger (Canada = Red and White)
  card.Cost?.forEach(entry => {
    addManaIconsFromText(entry || '', colorIdentity);
  });

  card['Text Box']?.forEach(entry => {
    addManaIconsFromText(entry || '', colorIdentity, true);
  });

  card['Subtype(s)']?.forEach(entry => {
    const splitSubtypes = (entry || '').split(';');
    splitSubtypes.forEach(typeEntry => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add(mappedColor);
      }
    });
  });
  return Array.from(colorIdentity);
};

const manaSymbolColorMatching: Record<
  string,
  | 'White'
  | 'Black'
  | 'Red'
  | 'Blue'
  | 'Green'
  | 'Purple'
  | 'Pickle'
  | 'Yellow'
  | 'Brown'
  | 'Pink'
  | 'Teal'
  | 'Orange'
  // | undefined
> = {
  W: 'White',
  B: 'Black',
  U: 'Blue',
  R: 'Red',
  G: 'Green',
  P: 'Purple',
  HW: 'White',
  HB: 'Black',
  HU: 'Blue',
  HR: 'Red',
  HG: 'Green',
  HP: 'Purple',
  UU: 'Blue',
  BB: 'Black',
  RR: 'Red',
  GE: 'Green',
  TG: 'Green',
  Pickle: 'Pickle',
  Yellow: 'Yellow',
  Brown: 'Brown',
  Pink: 'Pink',
  Teal: 'Teal',
  Orange: 'Orange',
  TEMU: 'Orange',
  Ketchup: 'Red',
  Mustard: 'Red',
  Venezuela: 'White',
  Stab: 'Red',
  Microwave: 'Red',
  Bitcoin: 'Black',
};

const landToColorMapping: Record<
  string,
  'White' | 'Black' | 'Red' | 'Blue' | 'Green' | 'Piss' | 'Pickle' | undefined | 'Purple'
> = {
  Plains: 'White',
  Swamp: 'Black',
  Island: 'Blue',
  IslandGX: 'Blue', // TODO: I have sinned
  Mountain: 'Red',
  Forest: 'Green',
  Nebula: 'Purple',
};
//"{3/P}{U}",
