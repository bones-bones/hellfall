
import { HCCard, HCCardFace, HCLayout, HCLayoutGroup } from '@hellfall/shared/types';
const subLayouts = [
  'token',
  'emblem',
  'checklist',
  'misc',
  'stickers',
  'dungeon',
  'meld_result',
  'inset',
  'prepare',
  'reminder',
];
// these props are ignored when the merging face is a sublayout
const subProps = ['mana_value', 'colors', 'layout'];

// Any prop not in one of the following lists is always ignored from the merging faces
// these props are concatenated, separated by ' // '
const concatProps = [
  'name',
  'flavor_name',
  'mana_cost',
  'type_line',
  'power',
  'toughness',
  'loyalty',
  'defense',
  'hand_modifier',
  'life_modifier',
];
// these props are concatenated, separated by '\\n\\n---\\n\\n'
const multiLineConcatProps = ['oracle_text', 'flavor_text'];
// these props are combined in some other way
const combineProps = ['mana_value', 'colors'];
// these props always overwrite the main face when they exist
const overwriteProps = ['layout'];
// these props are stored when the main face's prop doesn't exist but they do
const addProps = ['image'];
/**
 * merges 2 or more card faces
 * @param faces array of card faces to merge
 * @returns merged card face
 */
export const mergeHCCardFaces = (faces: HCCardFace.MultiFaced[]): HCCardFace.MultiFaced => {
  faces.slice(1).forEach((face, i) => {
    Object.entries(face)
      .filter(([key, value]) => !(subProps.includes(key) && subLayouts.includes(face.layout)))
      .forEach(([key, value]) => {
        if (face[key as keyof typeof face]) {
          if (overwriteProps.includes(key)) {
            if (key == 'layout' && !(value == 'flip' && faces[0].layout == 'transform')) {
              faces[0][key] = face[key];
            }
          } else if (combineProps.includes(key)) {
            switch (key) {
              case 'mana_value': {
                faces[0][key] += face[key];
                break;
              }
              case 'colors': {
                face[key].forEach(color => {
                  if (!faces[0].colors?.includes(color)) {
                    faces[0].colors?.push(color);
                  }
                });
                break;
              }
            }
          } else if (addProps.includes(key)) {
            if (key == 'image' && !faces[0][key]) {
              faces[0][key] = face[key];
              faces[0].image_status = face.image_status;
            }
          } else if (concatProps.includes(key)) {
            if (key in faces[0]) {
              const needed =
                i +
                1 -
                ((faces[0][key as keyof HCCardFace.MultiFaced] as string)?.match(/ \/\/ /g)
                  ?.length || 0);
              (faces[0] as any)[key] += ' // '.repeat(needed > 0 ? needed : 1) + value;
            } else {
              (faces[0] as any)[key] = ' // '.repeat(i + 1) + value;
            }
          } else if (multiLineConcatProps.includes(key)) {
            if (key in faces[0]) {
              const needed =
                i +
                1 -
                ((faces[0][key as keyof HCCardFace.MultiFaced] as string)?.match(
                  /\\\\n\\\\n---\\\\n\\\\n/g
                )?.length || 0);
              (faces[0] as any)[key] += '\\n\\n---\\n\\n'.repeat(needed > 0 ? needed : 1) + value;
            } else {
              (faces[0] as any)[key] = '\\n\\n---\\n\\n'.repeat(i + 1) + value;
            }
          }
        }
      });
  });
  return faces[0];
};
