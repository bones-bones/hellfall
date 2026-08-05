import { faceType, HCCard } from '@hellfall/shared/types';
import { fixName } from '../textHandling';
import { splitSetCode } from '../setHandling';

// breaks circular
const toFaces = (card: HCCard.Any, dropFaces?: boolean): faceType[] => {
  if ('card_faces' in card) {
    if (dropFaces) {
      return card.card_faces.filter(face => !face.drop_face);
    }
    return card.card_faces;
  }
  return [card];
};

/**
 * Gets all names for a card other than its normal name (for accessibility)
 * @param card card to get other names for
 */
export const getOtherNames = (card: HCCard.Any): string[] | undefined => {
  const names = [];
  if (card.tags?.includes('irregular-face-name') && 'card_faces' in card) {
    names.push(card.card_faces.map(face => face.name).join(' \\ '));
  }
  if (card.flavor_name) {
    names.push(card.flavor_name);
  }
  if ('card_faces' in card && card.card_faces.find(face => face.flavor_name)) {
    names.push(
      ...(card.card_faces
        .filter(face => face.flavor_name)
        .map(face => face.flavor_name) as string[])
    );
  }
  return names.length ? names : undefined;
};

const combineFaceNames = (faceNames: string[][]): string[] => {
  if (!faceNames.length) {
    return [];
  }
  let combinations: string[] = [...faceNames[0]];

  // Combine with each subsequent face
  for (let i = 1; i < faceNames.length; i++) {
    const newCombinations: string[] = [];
    const currentFace = faceNames[i];

    for (const prefix of combinations) {
      for (const name of currentFace) {
        newCombinations.push(`${prefix} // ${name}`);
      }
    }
    combinations = newCombinations;
  }
  return combinations;
};
/**
 * Gets all names for a card that would be an exact match (for filters)
 * @param card card to get all names for
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getAllNames = (card: HCCard.Any, dropFaces?: boolean): string[] => {
  const fixed = fixName(card.name);
  const names: string[] = [fixed];
  const { name, code } = splitSetCode(fixed);
  if (name != fixed) {
    names.push(name);
  }
  while (names.at(-1)?.endsWith(' <hc>')) {
    names.push(splitSetCode(names.at(-1)!).name);
  }
  if (card.flavor_name) {
    names.push(fixName(card.flavor_name));
  }
  if (card.export_name) {
    names.push(fixName(card.export_name));
  }
  if (!('card_faces' in card) && !code) {
    return names;
  }
  const nameSet = new Set<string>(names);
  const addName = (name: string) => nameSet.add(fixName(name));
  if ('card_faces' in card) {
    const faceNames: string[][] = toFaces(card, dropFaces).map(face => {
      const ns = [face.name];
      if (face.flavor_name) {
        ns.push(face.flavor_name);
      }
      if (face.export_name) {
        ns.push(face.export_name);
      }
      return ns;
    });
    for (let i = 0; i < card.card_faces.length; i++) {
      for (let j = i + 1; j < card.card_faces.length; j++) {
        combineFaceNames(faceNames.slice(i, j)).forEach(addName);
      }
    }
  }
  if (code) {
    const ending = ` <${code.toLowerCase()}>`;
    nameSet.forEach(name => {
      if (!name.endsWith(ending)) {
        addName(`${name}${ending}`);
      }
    });
  }
  return Array.from(nameSet);
};
