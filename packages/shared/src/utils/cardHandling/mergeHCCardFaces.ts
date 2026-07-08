import { HCCard, HCCardFace, HCLayout } from '@hellfall/shared/types';
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
const combineProps = ['mana_value', 'colors', 'types'];
// these props always overwrite the main face when they exist
const overwriteProps = ['layout'];
// these props are stored when the main face's prop doesn't exist but they do
const addProps = ['image'];
const removeProps = ['compress_face'];
/**
 * merges 2 or more card faces
 * @param faces array of card faces to merge
 * @returns merged card face
 */
export const mergeHCCardFaces = (faces: HCCardFace.MultiFaced[]): HCCardFace.MultiFaced => {
  faces.slice(1).forEach((face, i) => {
    if (faces[0].compress_face && !face.compress_face) {
      delete faces[0].compress_face;
    }
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
              case 'types': {
                if (!faces[0][key]) {
                  // This ensures ' // Do' has the right main type
                  faces[0][key] = face[key];
                }
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

/**
 * Compresses the card faces of a card to make it suitable for export (Not for use with cockatrice)
 * @param card card to compress
 */
export const compressHCCardFaces = (card: HCCard.Any) => {
  const newCard = structuredClone(card);
  if ('card_faces' in newCard) {
    const goingToCompressAll = Boolean(
      newCard.card_faces.length > 2 &&
        newCard.card_faces.filter(face => !face.compress_face && !face.drop_face).length == 1
    );
    for (let i = newCard.card_faces.length - 1; i > 0; i--) {
      if (newCard.card_faces[i].compress_face) {
        newCard.card_faces[i - 1] = mergeHCCardFaces([
          newCard.card_faces[i - 1],
          newCard.card_faces[i],
        ]);
        newCard.card_faces.splice(i, 1);
      } else if (newCard.card_faces[i].drop_face) {
        newCard.card_faces.splice(i, 1);
      }
    }

    // compress down to 1 side and use front image if there are still too many sides
    if (goingToCompressAll) {
      newCard.card_faces[0].image = newCard.image;
      if (newCard.still_image) {
        newCard.card_faces[0].still_image = newCard.still_image;
      }
      if (newCard.rotated_image) {
        newCard.card_faces[0].rotated_image = newCard.rotated_image;
      }
    } else {
      if (!newCard.card_faces[0].image) {
        newCard.card_faces[0].image = newCard.image;
        if (!newCard.card_faces[0].rotated_image && newCard.rotated_image) {
          newCard.card_faces[0].rotated_image = newCard.rotated_image;
        }
      }
      if (!newCard.card_faces[0].still_image && newCard.still_image) {
        newCard.card_faces[0].still_image = newCard.still_image;
      }
    }
  }
  if (card.layout == HCLayout.Cube) {
    newCard.name = card.export_name ?? card.name;
  }
  return newCard;
};
