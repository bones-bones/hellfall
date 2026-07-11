import {
  HCCard,
  HCCardFace,
  HCImageStatus,
  HCLayout,
  HCLayoutGroup,
  HCColor,
  HCColors,
  HCFrameEffect,
  TransformFrameEffects,
  NoIdentityFaceLayouts,
  EffectFrames,
  FrontIdentityLayouts,
  FrontManaValueFaceLayouts,
  NoManaValueFaceLayouts,
  faceType,
} from '@hellfall/shared/types';
import {
  listContainsList,
  listContainsSomeList,
  listIncludesValue,
  listIncludesValueLower,
  listIncludesValueLowerEvery,
  listsShare,
} from '../listHandling';
import { getColorsFromText, getMVFromCost, getPipColorsFromText } from '../pipsHandling';
import { splitParens, textContains, toExportName } from '../textHandling';
import { CardMap, getAllRelated, hasTokenHCID, toFaces } from '../cardHandling';
import { orderColors, orderHybrid } from '../orderColors';
import { isInteger } from '../numHandling';
import { getDefaultKindLayout, getDefaultTypeLayout } from './defaults';
import {
  baseIncludesFlag,
  fillSubKeywords,
  getBaseDiffs,
  getChangesFromTag,
  splitTagComponents,
} from './tagHandling';
import { anyChange, createFaceChange, sortChanges } from './changeTypes';
import { applyChanges, removeDuplicateChanges } from './changeHandling';
import { getChangesFromDifferences } from './getCardDiff';
import { cleanParts, updateParts } from './partsHandling';

const ignoreFaceIdentityImageStatus: HCImageStatus[] = [
  HCImageStatus.Dungeon,
  HCImageStatus.Token,
  HCImageStatus.Reminder,
  HCImageStatus.Stickers,
  HCImageStatus.DraftPartner,
];

export const landNames = [
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Nebula',
  'Wastes',
  'Snow-Covered Plains',
  'Snow-Covered Island',
  'Snow-Covered Swamp',
  'Snow-Covered Mountain',
  'Snow-Covered Forest',
  'Snow-Covered Nebula',
  'Snow-Covered Wastes',
];

const getColorIdentityProps = (
  card: HCCard.Any
): { color_identity: HCColors; color_identity_hybrid: HCColors[] } => {
  const colorIdentity = new Set<string>();
  const colorIdentityHybrid: HCColors[] = [];
  const addColors = (colors: HCColors) => {
    colors.forEach(color => {
      if (color != HCColor.Colorless) {
        colorIdentity.add(color);
      }
    });
    if (colors && !colors.includes(HCColor.Colorless) && colors.length > 0) {
      // if the new colors do not contain some existing color set
      // if (!colorIdentityHybrid.some(colorSet => colorSet.every(color => colors.includes(color)))) {
      // if (!colorIdentityHybrid.some(colorSet => listContainsList(colors,colorSet))) {
      if (!listContainsSomeList(colors, colorIdentityHybrid)) {
        for (let i = colorIdentityHybrid.length - 1; i >= 0; i--) {
          // if the new color set is completely inside an existing color set, delete the existing one
          // if (colors.every(color => colorIdentityHybrid[i].includes(color))) {
          if (listContainsList(colorIdentityHybrid[i], colors)) {
            colorIdentityHybrid.splice(i, 1);
          }
        }
        colorIdentityHybrid.push(colors);
      }
    }
  };
  const addColorsFromFace = (face: HCCard.AnySingleFaced | HCCardFace.MultiFaced) => {
    getPipColorsFromText(face.mana_cost).forEach(colorSet => addColors(colorSet));

    const minusReminderText = splitParens(face.oracle_text)
      .filter(e => e[0] && e[0] != '(')
      .join('');
    getPipColorsFromText(minusReminderText).forEach(colorSet => addColors(colorSet));

    const splitSubtypes = face.subtypes || [];
    splitSubtypes.forEach(typeEntry => {
      if (typeEntry == 'Carnival' && card.tags?.includes('ignore-carnival-identity')) return;
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        addColors([mappedColor]);
      }
    });

    if (face.color_indicator) {
      face.color_indicator?.forEach(color => {
        addColors([color]);
      });
    }
  };

  if ('card_faces' in card) {
    // this way it ignores face 0
    const lastImageIndex = card.card_faces.findLastIndex((face, i) => face.image && i);
    // add each face that isn't an ignored layout or the last image in a layout that ignores the last image
    card.card_faces.forEach((entry, i) => {
      if (
        !(NoIdentityFaceLayouts.includes(entry.layout) && card.kind == 'card' && i) &&
        !ignoreFaceIdentityImageStatus.includes(entry.image_status) &&
        !(FrontIdentityLayouts.includes(card.layout) && i == lastImageIndex) &&
        !(card.layout == HCLayout.Specialize && i != 0)
      ) {
        addColorsFromFace(entry);
      }
    });
  } else {
    addColorsFromFace(card);
  }
  return {
    color_identity: Array.from(colorIdentity) as HCColors,
    color_identity_hybrid: colorIdentityHybrid,
  };
};

/**
 * First get, then apply, the changes caused by a new `base_tags` array
 * @param card card to apply changes to
 * @param newBase new `base_tags` array
 */
export const applyChangesFromNewBase = (card: HCCard.Any, newBase: string[]) => {
  const { added, deleted } = getBaseDiffs(card.base_tags ?? [], newBase);
  const changeList: anyChange[] = [];
  changeList.push(...added.flatMap(tag => getChangesFromTag(card, 'add', tag)));
  changeList.push(...deleted.flatMap(tag => getChangesFromTag(card, 'delete', tag)));

  changeList.sort(sortChanges);
  removeDuplicateChanges(changeList);
  applyChanges(card, changeList);
};

/**
 * Sets derived props for a card
 * @param card card to set derived props of
 * @param tags new tag list, if any
 */
export const setDerivedProps = (
  card: HCCard.Any,
  tags?: string[]
) /* :{card:HCCard.Any;relateds?:HCCard.Any[]}  */ => {
  // todo: make sure this works when tags are empty
  if (tags) {
    while (tags[0] == '') {
      tags.shift();
    }
    while (tags.at(-1) == '') {
      tags.pop();
    }
    tags = Array.from(new Set(tags));
    applyChangesFromNewBase(card, tags);
  }
  const changes: anyChange[] = [];
  toFaces(card).forEach((face, i) => {
    if (face.layout == getDefaultKindLayout(card, i)) {
      const layout = getDefaultTypeLayout(card, i);
      if (!layout) return;
      const change = createFaceChange('add', 'layout', layout, i);
      changes.push(change);
    }
  });
  if (changes.length) {
    applyChanges(card, changes);
  }

  const getKeywordsFromFace = (face: faceType, i: number) => {
    const keywords: string[] = [];
    if (
      listIncludesValueLower(face.types, 'enchantment') &&
      listIncludesValueLower(face.subtypes, 'aura') &&
      textContains(face.oracle_text, 'enchant ')
    ) {
      keywords.push('enchant');
    }
    if (
      listIncludesValueLower(face.types, 'artifact') &&
      listIncludesValueLower(face.subtypes, 'equipment') &&
      ['equip (', 'equip—'].some(text => textContains(face.oracle_text, text))
    ) {
      keywords.push('equip');
    }
    if (
      listIncludesValueLower(face.types, 'artifact') &&
      listIncludesValueLower(face.subtypes, 'vehicle') &&
      textContains(face.oracle_text, 'crew ')
    ) {
      keywords.push('crew');
    }
    if (
      listIncludesValueLowerEvery(face.types, ['artifact', 'creature']) &&
      listIncludesValueLower(face.subtypes, 'equipment') &&
      ['reconfigure {', 'reconfigure—'].some(text => textContains(face.oracle_text, 'equip '))
    ) {
      keywords.push('reconfigure');
    }
    fillSubKeywords(keywords);
    return keywords;
  };
  const getFrameEffectsFromFace = (face: faceType, i: number) => {
    const effects: HCFrameEffect[] = [];
    if (face.frame ? EffectFrames.includes(face.frame) : EffectFrames.includes(card.frame)) {
      if (
        ((listIncludesValueLower(face.supertypes, 'legendary') &&
          !listIncludesValueLower(face.types, 'planeswalker') &&
          !listIncludesValueLower(face.types, 'player') &&
          !baseIncludesFlag(card, 'missing-legend-frame', i)) ||
          baseIncludesFlag(card, 'legend-frame', i)) &&
        !face.frame_effects?.includes(HCFrameEffect.Legendary)
      ) {
        effects.push(HCFrameEffect.Legendary);
      }
      if (
        listIncludesValueLower(face.supertypes, 'snow') &&
        !baseIncludesFlag(card, 'missing-snow-frame', i) &&
        !face.frame_effects?.includes(HCFrameEffect.Snow)
      ) {
        effects.push(HCFrameEffect.Snow);
      }
      if (
        listIncludesValueLower(face.subtypes, 'lesson') &&
        !baseIncludesFlag(card, 'missing-lesson-frame', i) &&
        !face.frame_effects?.includes(HCFrameEffect.Lesson)
      ) {
        effects.push(HCFrameEffect.Lesson);
      }
      if (
        listIncludesValueLower(face.subtypes, 'vehicle') &&
        !baseIncludesFlag(card, 'missing-vehicle-frame', i) &&
        !face.frame_effects?.includes(HCFrameEffect.Vehicle)
      ) {
        effects.push(HCFrameEffect.Vehicle);
      }
    } else if (
      ((listIncludesValueLower(face.supertypes, 'legendary') &&
        !listIncludesValueLower(face.types, 'planeswalker') &&
        !listIncludesValueLower(face.types, 'player') &&
        baseIncludesFlag(card, 'hearthstone-frame', i) &&
        !baseIncludesFlag(card, 'missing-legend-frame', i)) ||
        baseIncludesFlag(card, 'legend-frame', i)) &&
      !face.frame_effects?.includes(HCFrameEffect.Legendary)
    ) {
      effects.push(HCFrameEffect.Legendary);
    }

    if ('card_faces' in card) {
      if (
        !i &&
        card.layout == HCLayout.Transform &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-transform-frame', i)
      ) {
        effects.push(HCFrameEffect.TransformDfc);
      } else if (
        !i &&
        card.layout == HCLayout.Modal &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-mdfc-frame', i)
      ) {
        effects.push(HCFrameEffect.Mdfc);
      } else if (
        !i &&
        card.layout == HCLayout.Cube &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-cube-frame', i)
      ) {
        effects.push(HCFrameEffect.Cube);
      } else if (
        !i &&
        card.layout == HCLayout.Specialize &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-specialize-frame', i)
      ) {
        effects.push(HCFrameEffect.Specialize);
      } else if (
        face.layout == HCLayout.Transform &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-transform-frame', i)
      ) {
        const effect = card.card_faces[0].frame_effects?.find(effect =>
          TransformFrameEffects.includes(effect)
        );
        effects.push(effect ? effect : HCFrameEffect.TransformDfc);
      } else if (
        face.layout == HCLayout.Modal &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-mdfc-frame', i)
      ) {
        effects.push(HCFrameEffect.Mdfc);
      } else if (
        face.layout == HCLayout.Cube &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-cube-frame', i)
      ) {
        effects.push(HCFrameEffect.Cube);
      } else if (
        face.layout == HCLayout.Specialize &&
        !listsShare(face.frame_effects, TransformFrameEffects) &&
        !baseIncludesFlag(card, 'missing-specialize-frame', i)
      ) {
        effects.push(HCFrameEffect.Specialize);
      }
    }
    return effects;
  };
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach((face, i) => {
      face.colors = orderColors(face.colors);
      if (face.color_indicator) {
        face.color_indicator = orderColors(face.color_indicator);
        face.colors = face.color_indicator;
      } else if (baseIncludesFlag(card, 'unnecessary-color-indicator', i)) {
        face.color_indicator = face.colors;
      } else if (card.kind == 'token' && face.mana_cost && !baseIncludesFlag(card, 'generic', i)) {
        face.colors = getColorsFromText(face.mana_cost);
      }
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      face.mana_value =
        i && !face.mana_cost && FrontManaValueFaceLayouts.includes(face.layout)
          ? card.card_faces.slice(0, i).findLast(f => f.mana_cost)?.mana_value ?? 0
          : getMVFromCost(face.mana_cost);
      mana_cost_list.push(face.mana_cost);
      const effects = [...(face.frame_effects ?? []), ...getFrameEffectsFromFace(face, i)];
      if (effects.length > 0 && card.kind != 'scryfall') {
        face.frame_effects = effects;
      }
      const keywords = getKeywordsFromFace(face, i);
      keywords.forEach(keyword => {
        if (!card.keywords.includes(keyword)) {
          card.keywords.push(keyword);
        }
      });
    });
    card.type_line = type_line_list.join(' // ');
    if (card.tags?.includes('italic-typeline')) {
      card.type_line = '*' + card.type_line + '*';
    }
    if (card.tags?.includes('underlined-typeline')) {
      card.type_line = '__' + card.type_line + '__';
    }
    card.mana_cost = mana_cost_list.filter(e => e).join(' // ');
  } else {
    card.colors = orderColors(card.colors);
    if (card.color_indicator) {
      card.color_indicator = orderColors(card.color_indicator);
    } else if (baseIncludesFlag(card, 'unnecessary-color-indicator')) {
      card.color_indicator = card.colors;
    } else if (
      card.kind == 'token' &&
      card.mana_cost &&
      !baseIncludesFlag(card, 'generic') &&
      !card.keywords.includes('devoid')
    ) {
      card.colors = getColorsFromText(card.mana_cost);
    }
    card.type_line = [
      card.supertypes?.join(' '),
      [card.types?.join(' '), card.subtypes?.join(' ')].filter(Boolean).join(' — '),
    ]
      .filter(Boolean)
      .join(' ') as string;
    const effects = [...(card.frame_effects ?? []), ...getFrameEffectsFromFace(card, 0)];
    if (effects.length > 0) {
      card.frame_effects = effects;
    }
    const keywords = getKeywordsFromFace(card, 0);
    keywords.forEach(keyword => {
      if (!card.keywords.includes(keyword)) {
        card.keywords.push(keyword);
      }
    });
  }
  if (card.kind == 'token') {
    if ('card_faces' in card) {
      card.mana_value = 0;
      const colors: HCColors = [];
      card.card_faces.forEach((face, i) => {
        if (
          !(
            NoManaValueFaceLayouts.includes(face.layout) && `multi_${face.layout}` != card.layout
          ) &&
          !(FrontManaValueFaceLayouts.includes(face.layout) && i)
        ) {
          card.mana_value += face.mana_value;
          colors.push(
            ...(face.color_indicator ??
              (face.mana_cost && !baseIncludesFlag(card, 'generic', i)
                ? getColorsFromText(face.mana_cost)
                : face.colors))
          );
        }
      });
      card.colors = orderColors(colors);
    } else if (card.mana_cost) {
      card.mana_value = getMVFromCost(card.mana_cost);
      if (!card.tags?.includes('generic') && !card.keywords.includes('devoid')) {
        card.colors = card.color_indicator ?? getColorsFromText(card.mana_cost);
      }
    } else if (card.color_indicator) {
      card.colors = card.color_indicator;
    }
  }
  if (card.tags?.includes('italic-typeline')) {
    card.type_line = '*' + card.type_line + '*';
  }
  if (card.tags?.includes('underlined-typeline')) {
    card.type_line = '__' + card.type_line + '__';
  }
  const { color_identity, color_identity_hybrid } = getColorIdentityProps(card);
  card.colors = orderColors(card.colors);
  card.color_identity = card.tags?.includes('no-color-identity') ? [] : orderColors(color_identity);
  card.color_identity_hybrid = card.tags?.includes('no-color-identity')
    ? []
    : orderHybrid(color_identity_hybrid);
};
const alwaysDropLayouts: HCLayoutGroup.FaceLayoutType[] = [
  HCLayout.DraftPartner,
  HCLayout.MeldResult,
  HCLayout.Specialize,
];
const conditionalDropLayouts: HCLayoutGroup.FaceLayoutType[] = [
  HCLayout.Checklist,
  HCLayout.Dungeon,
  HCLayout.Token,
  HCLayout.Emblem,
  HCLayout.Reminder,
  HCLayout.Misc,
  HCLayout.Stickers,
];
const alwaysCompressLayouts: HCLayoutGroup.FaceLayoutType[] = [
  HCLayout.Split,
  HCLayout.Aftermath,
  HCLayout.Prepare,
  HCLayout.Inset,
  HCLayout.Token,
  HCLayout.Flip,
  HCLayout.Cube,
];

/**
 * Sets the export props for a card
 * @param card card to set the export props of
 * @param takenNames list of names that are already taken (for the purposes of setting `export_name`)
 */
export const setExportProps = (card: HCCard.Any, takenNames: string[]) => {
  if ('card_faces' in card) {
    const toFinalExportName = (name: string) => {
      let exportName = toExportName(name);
      if (['token', 'notmagic', 'scryfall'].includes(card.kind)) {
        let i = 1;
        while (takenNames.includes(exportName + i)) {
          i++;
        }
        exportName += i;
      }
      if (exportName.startsWith('(') || /^\d/.test(exportName)) {
        exportName = '_' + exportName;
      }
      if (exportName.endsWith(')')) {
        exportName += '_';
      }
      while (takenNames.includes(exportName) || isInteger(exportName)) {
        exportName += '_';
      }
      return exportName;
    };
    if (card.layout == HCLayout.Cube) {
      card.card_faces.forEach((face, i) => {
        if (i) {
          face.compress_face = true;
        }
      });
      return;
    }
    // deal with simple flips
    if (card.card_faces.length == 2 && card.layout == 'flip') {
      const fullName = card.card_faces.map((face, index) => {
        let name = face.name;
        if (!face.name) {
          name = `${index ? 'Bottom' : 'Top'} of ${card.card_faces[1 - index].name}`;
        } else if (index && face.name == card.card_faces[0].name) {
          name += ' (Bottom)';
        }

        const exportName = toFinalExportName(name);

        if (exportName != face.name && exportName != card.name) {
          face.export_name = exportName;
        }
        takenNames.push(exportName);
        if (index) {
          face.compress_face = true;
        }
        return exportName;
      });
      const exportName = toFinalExportName(fullName[0] + ' // ' + fullName[1]);
      if (exportName != card.name) {
        card.export_name = exportName;
      }
      takenNames.push(exportName);
      return;
    }

    // compress/drop layouts that should always be compressed or should be dropped
    card.card_faces.slice(1).forEach(face => {
      if (alwaysDropLayouts.includes(face.layout)) {
        face.drop_face = true;
      } else if (conditionalDropLayouts.includes(face.layout)) {
        if (
          listIncludesValue(
            card.all_parts?.map(part => part.name),
            face.name
          )
        ) {
          face.drop_face = true;
        } else if (!face.image) {
          face.compress_face = true;
        }
      } else if (
        alwaysCompressLayouts.includes(face.layout) ||
        card.tags?.includes('compress-faces')
      ) {
        face.compress_face = true;
      }
    });
    // compress down to 1 side and use front image if there are still too many sides
    if (card.card_faces.filter(face => !face.compress_face && !face.drop_face).length > 2) {
      let hasIgnored = false;
      card.card_faces.forEach((face, i) => {
        if (i && baseIncludesFlag(card, 'no-compress', i) && !hasIgnored) {
          hasIgnored = true; // this way only one face can be ignored
        } else if (i && !face.compress_face && !face.drop_face) {
          face.compress_face = true;
        }
      });
    }
    card.card_faces.forEach((face, index) => {
      if (!face.compress_face && !face.drop_face) {
        let faceName = face.name;
        for (
          let i = index + 1;
          i < card.card_faces.length &&
          (card.card_faces[i].compress_face || card.card_faces[i].drop_face);
          i++
        ) {
          if (card.card_faces[i].compress_face) {
            faceName += ' // ' + card.card_faces[i].name;
          }
        }
        let exportName = toExportName(faceName);
        if (!exportName) {
          const otherIndex = card.card_faces.findIndex(
            (other, i) => !other.compress_face && !other.drop_face && i != index
          );
          const otherName =
            card.card_faces[otherIndex].export_name ||
            toExportName(card.card_faces[otherIndex].name);
          exportName = `${index > otherIndex ? 'Back' : 'Front'} of ${otherName}`;
        } else {
          const otherIndex = card.card_faces.findIndex(
            (other, i) =>
              i < index &&
              !other.compress_face &&
              !other.drop_face &&
              (exportName == other.export_name || exportName == toExportName(other.name))
          );
          if (otherIndex != -1 && exportName == toExportName(card.card_faces[0].name)) {
            exportName += ' (Back)';
          }
        }
        exportName = toFinalExportName(exportName);

        if (exportName != face.name && exportName != card.name && exportName != faceName) {
          face.export_name = exportName;
        }
        takenNames.push(exportName);
      }
    });
  } else {
    let exportName = toExportName(
      card.kind == 'land' && landNames.includes(card.name)
        ? `${card.name} (${card.hcid})`
        : hasTokenHCID(card)
        ? card.hcid
        : card.name
    );
    if (exportName.startsWith('(') || /^\d/.test(exportName)) {
      exportName = '_' + exportName;
    }
    if (exportName.endsWith(')')) {
      exportName += '_';
    }
    while (takenNames.includes(exportName) || isInteger(exportName)) {
      exportName += '_';
    }
    if (exportName != (hasTokenHCID(card) ? card.hcid : card.name)) {
      card.export_name = exportName;
    }
    takenNames.push(exportName);
  }
};

const manaSymbolColorMatching: Record<
  string,
  | 'White'
  | 'Black'
  | 'Red'
  | 'Blue'
  | 'Green'
  | 'Purple'
  | 'Yellow'
  | 'Brown'
  | 'Pink'
  | 'Teal'
  | 'Orange'
> = {};

export const landToColorMapping = {
  Plains: 'W',
  Ploons: 'W',
  Island: 'U',
  Swamp: 'B',
  Mountain: 'R',
  Moontain: 'R',
  Forest: 'G',
  Nebula: 'P',
  Oasis: 'Orange',
  Mudflats: 'Brown',
  'Gas-Station': 'Yellow',
  Carnival: 'Pink',
} as Record<string, HCColor>;

/**
 * Merges an existing card and a card from the google sheet
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 */
export const mergeFromSheet = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  if (existingCard.kind != newCard.kind) {
    existingCard.kind = newCard.kind;
  }
  const changeList = getChangesFromDifferences(existingCard, newCard, true);
  if (newCard.kind != 'scryfall') {
    applyChanges(existingCard, changeList, true);
    setDerivedProps(existingCard);
  } else {
    newCard.all_parts = existingCard.all_parts;
    setDerivedProps(newCard);
    return newCard;
  }
  // if (newCard.base_tags) {
  //   existingCard.base_tags = newCard.base_tags;
  // } else {
  //   delete existingCard.base_tags;
  // }
  return existingCard;
};

/**
 * Updates a card along with its related cards
 * @param card card to apply the changes to
 * @param changeList changes to apply to the card
 * @param cardMap the map of cards
 */
export const applyFromMap = (card: HCCard.Any, changeList: anyChange[], cardMap: CardMap) => {
  const oldRelateds = getAllRelated(card, cardMap);
  if (!applyChanges(card, changeList)) return;
  const newRelateds = getAllRelated(card, cardMap);
  setDerivedProps(card);
  updateParts(card, newRelateds);
  cleanParts(card, oldRelateds);
};
