import { faceType, HCCard } from '@hellfall/shared/types';
import { fixName } from '../textHandling';
import { splitAngleSetCode } from '../setHandling';
import { SequenceMatcher } from 'difflib-ts';
import { stringIterable } from '../listHandling';

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
  const { name, code } = splitAngleSetCode(fixed);
  if (name != fixed) {
    names.push(name);
  }
  while (names.at(-1)?.endsWith(' <hc>')) {
    names.push(splitAngleSetCode(names.at(-1)!).name);
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

/**
 * Score how well request words match name words in order (prefix ok).
 * @param nameWords words from the name
 * @param reqWords words from the request
 */
const wordPrefixScore = (nameWords: string[], reqWords: string[]): number => {
  if (!reqWords.length) return 0;
  let score = 0;
  for (const reqWord of reqWords) {
    let found = false;
    for (let i = 0; i < nameWords.length && !found; i++) {
      const nameWord = nameWords[i];
      if (nameWord.includes(reqWord) || reqWord.includes(nameWord)) {
        const overlap =
          nameWord == reqWord
            ? 1
            : Math.min(reqWord.length, nameWord.length) / Math.max(reqWord.length, nameWord.length);
        const mult =
          overlap == 1 ? 3 : nameWord.startsWith(reqWord) || reqWord.startsWith(nameWord) ? 2 : 1;
        score += mult * overlap;
        found = true;
      }
    }
    if (!found) {
      score--;
    }
  }
  return score / reqWords.length;
};
const similarity = (name: string, request: string): number => {
  const ratio = new SequenceMatcher(undefined, request, name).ratio();
  let score = ratio * 1000;
  if (name.startsWith(request)) {
    score += 500 * (request.length / name.length);
  } else if (request.startsWith(name)) {
    score += 300 * (name.length / request.length);
  }
  if (request.includes(name)) {
    score += 400 * (request.length / name.length);
  } else if (name.includes(request)) {
    score += 300 * (name.length / request.length);
  }
  score += wordPrefixScore(name.split(' '), request.split(' ')) * 200;

  score *= Math.min(request.length, name.length) / Math.max(request.length, name.length) ** 0.3;

  return score;
};

/**
 * Gets the closest card name to a requested card name. Only use this if there are no exact matches.
 * The code for this is based on the mork code.
 * @param names all card names
 * @param requestName the requested name
 */

export const getClosestName = (names: stringIterable, requestName: string) => {
  let maxWeight = -1;
  let maxWeightName = '';
  for (const name of names) {
    const currentWeight = similarity(name, requestName);
    if (
      currentWeight > maxWeight ||
      (currentWeight == maxWeight && name.length < maxWeightName.length)
    ) {
      maxWeight = currentWeight;
      maxWeightName = name;
    }
  }
  return maxWeightName;
};
