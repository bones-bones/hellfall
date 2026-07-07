import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';

export type CubeListSectionId =
  | 'white'
  | 'blue'
  | 'black'
  | 'red'
  | 'green'
  | 'multicolor'
  | 'other'
  | 'colorless'
  | 'land';

export const CUBE_LIST_SECTIONS: { id: CubeListSectionId; label: string }[] = [
  { id: 'white', label: 'White' },
  { id: 'blue', label: 'Blue' },
  { id: 'black', label: 'Black' },
  { id: 'red', label: 'Red' },
  { id: 'green', label: 'Green' },
  { id: 'multicolor', label: 'Multicolor' },
  { id: 'other', label: 'Other colors' },
  { id: 'colorless', label: 'Colorless' },
  { id: 'land', label: 'Lands' },
];

export type CubeTypeBucket =
  | 'creature'
  | 'planeswalker'
  | 'instant'
  | 'sorcery'
  | 'artifact'
  | 'enchantment'
  | 'battle'
  | 'other';

const TYPE_BUCKET_ORDER: CubeTypeBucket[] = [
  'creature',
  'planeswalker',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'battle',
  'other',
];

const colorSortValue: Record<HCColor, number> = {
  W: 1,
  U: 10,
  B: 100,
  R: 1000,
  G: 10_000,
  P: 100_000,
  C: 1_000_000,
  Yellow: 10_000_000,
  Brown: 10_000_000,
  Pink: 10_000_000,
  Teal: 10_000_000,
  Orange: 10_000_000,
  TEMU: 10_000_000,
  Cyan: 10_000_000,
  Ultraviolet: 10_000_000,
  Gold: 10_000_000,
  Beige: 10_000_000,
  Grey: 10_000_000,
  Lime: 10_000_000,
};

const singleColorSection: Partial<Record<HCColor, CubeListSectionId>> = {
  W: 'white',
  U: 'blue',
  B: 'black',
  R: 'red',
  G: 'green',
};

export const getCardColors = (card: HCCard.Any): HCColors => {
  if ('card_faces' in card) {
    return card.card_faces[0].colors ?? [];
  }
  return card.colors ?? [];
};

export const getCardTypesLower = (card: HCCard.Any): string[] => {
  if ('card_faces' in card) {
    return card.card_faces[0].types?.map(type => type.toLowerCase()) ?? [];
  }
  return card.types?.map(type => type.toLowerCase()) ?? [];
};

export const getTypeBucket = (card: HCCard.Any): CubeTypeBucket => {
  const types = getCardTypesLower(card);
  if (types.includes('creature')) return 'creature';
  if (types.includes('planeswalker')) return 'planeswalker';
  if (types.includes('instant')) return 'instant';
  if (types.includes('sorcery')) return 'sorcery';
  if (types.includes('artifact')) return 'artifact';
  if (types.includes('enchantment')) return 'enchantment';
  if (types.includes('battle')) return 'battle';
  return 'other';
};

export const getColorSection = (card: HCCard.Any): CubeListSectionId => {
  if (getCardTypesLower(card).includes('land')) {
    return 'land';
  }
  const colors = getCardColors(card).filter(color => color !== 'C');
  if (!colors.length) {
    return 'colorless';
  }
  if (colors.length > 1) {
    return 'multicolor';
  }
  return singleColorSection[colors[0]] ?? 'other';
};

export const formatTypeLine = (card: HCCard.Any): string => {
  if ('card_faces' in card) {
    const face = card.card_faces[0];

    const firstPart = [...(face.supertypes ?? []), ...(face.types ?? [])].join(' ');
    const secondPart = [...(face.subtypes ?? [])].join(' ');
    const parts = [firstPart, secondPart].filter(Boolean).join(' — ');

    return parts;
  }

  const firstPart = [...(card.supertypes ?? []), ...(card.types ?? [])].join(' ');
  const secondPart = [...(card.subtypes ?? [])].join(' ');
  const parts = [firstPart, secondPart].filter(Boolean).join(' — ');

  return parts;
};

const colorNumber = (card: HCCard.Any) =>
  getCardColors(card)
    .map(color => colorSortValue[color])
    .reduce((total, curr) => total + curr, 0) || colorSortValue.C;

export const compareCubeListCards = (a: HCCard.Any, b: HCCard.Any): number => {
  const colorDiff = colorNumber(a) - colorNumber(b);
  if (colorDiff) {
    return colorDiff;
  }
  const mvDiff = a.mana_value - b.mana_value;
  if (mvDiff) {
    return mvDiff;
  }
  const typeDiff =
    TYPE_BUCKET_ORDER.indexOf(getTypeBucket(a)) - TYPE_BUCKET_ORDER.indexOf(getTypeBucket(b));
  if (typeDiff) {
    return typeDiff;
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
};

export const groupCubeCards = (
  cards: HCCard.Any[]
): { section: (typeof CUBE_LIST_SECTIONS)[number]; cards: HCCard.Any[] }[] => {
  const buckets = new Map<CubeListSectionId, HCCard.Any[]>();
  for (const section of CUBE_LIST_SECTIONS) {
    buckets.set(section.id, []);
  }
  for (const card of cards) {
    buckets.get(getColorSection(card))!.push(card);
  }
  return CUBE_LIST_SECTIONS.map(section => ({
    section,
    cards: (buckets.get(section.id) ?? []).sort(compareCubeListCards),
  })).filter(entry => entry.cards.length > 0);
};

export const isPlayableCubeCard = (card: HCCard.Any) =>
  !card.tags?.includes('offensive') && card.kind !== 'token';

/** Main playable cubes on the resources page (excludes veto-only rows). */
export const cubeResourceSetCodes = [
  'HLC',
  'HC2',
  'HC3',
  'HC4',
  'HC5',
  'HCV',
  'HC6',
  'HCC',
  'HCP',
  'HC7',
  'NRM',
  'HCK',
  'HC8',
  'HCJ',
  'HKL',
] as const;
