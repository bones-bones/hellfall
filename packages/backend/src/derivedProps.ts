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
  NewFrames,
  HCFrame,
} from '@hellfall/shared/types';
import { splitParens, toExportName } from '@hellfall/shared/utils/textHandling.ts';
import { getPipsData } from '@hellfall/shared/services/pipsService.ts';
import { orderColors } from '@hellfall/shared/utils/orderColors.ts';

const ignoreFaceIdentityImageStatus: HCImageStatus[] = [
  HCImageStatus.Dungeon,
  HCImageStatus.Token,
  HCImageStatus.Reminder,
  HCImageStatus.Stickers,
  HCImageStatus.DraftPartner,
];

export const getColorIdentityProps = (
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
      // if the new colors do not contain some existing colorSet
      if (!colorIdentityHybrid.some(colorSet => colorSet.every(color => colors.includes(color)))) {
        for (let i = colorIdentityHybrid.length - 1; i >= 0; i--) {
          // if the new colorSet is completely inside the existing colorSet, delete the existing one
          if (colors.every(color => colorIdentityHybrid[i].includes(color))) {
            colorIdentityHybrid.splice(i, 1);
          }
        }
        colorIdentityHybrid.push(colors);
      }
    }
  };
  const pips = getPipsData();
  const addColorsFromFace = (face: HCCard.AnySingleFaced | HCCardFace.MultiFaced) => {
    const costNames = face.mana_cost.match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    costNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        addColors(pip.colors!);
      } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            addColors([mappedColor]);
          }
        }*/
    });

    const minusReminderText = splitParens(face.oracle_text)
      .filter(e => e[0] && e[0] != '(')
      .join('');
    const textNames = (minusReminderText || '')
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1));

    textNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        addColors(pip.colors!);
      } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            addColors([mappedColor]);
          }
        }*/
    });

    const splitSubtypes = face.subtypes || [];
    splitSubtypes.forEach(typeEntry => {
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
    // add each face that isn't an ignored image_status or the last image in a layout that ignores the last image
    card.card_faces.forEach((entry, i) => {
      if (
        !ignoreFaceIdentityImageStatus.includes(entry.image_status as HCImageStatus) &&
        !(
          HCLayoutGroup.FrontIdentityLayout.includes(
            card.layout as HCLayoutGroup.FrontIdentityLayoutType
          ) && i == lastImageIndex
        ) &&
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

export const getMVFromCost = (cost: string): number => {
  const pips = getPipsData();
  return (
    cost
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1))
      ?.reduce((totalMV, pipName) => {
        const pip = pips?.find(e => e.symbol.toLowerCase() === pipName.toLowerCase());
        return totalMV + (pip?.mana_value || 0);
      }, 0) || 0
  );
};

export const setDerivedProps = (card: HCCard.Any) => {
  const getFrameEffectsFromFace = (face: HCCard.AnySingleFaced | HCCardFace.MultiFaced) => {
    const effects: HCFrameEffect[] = [];
    if (
      face.frame
        ? NewFrames.includes(face.frame as HCFrame)
        : NewFrames.includes(card.frame as HCFrame)
    ) {
      if (
        ((face.supertypes?.some(type => type.toLowerCase() == 'legendary') &&
          !face.types?.some(type => type.toLowerCase() == 'planeswalker') &&
          !face.types?.some(type => type.toLowerCase() == 'player') &&
          !card.tags?.includes('missing-legend-frame')) ||
          card.tags?.includes('legend-frame')) &&
        !face.frame_effects?.includes(HCFrameEffect.Legendary)
      ) {
        effects.push(HCFrameEffect.Legendary);
      }
      if (
        face.supertypes?.some(type => type.toLowerCase() == 'snow') &&
        !card.tags?.includes('missing-snow-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Snow)
      ) {
        effects.push(HCFrameEffect.Snow);
      }
      if (
        face.subtypes?.some(type => type.toLowerCase() == 'lesson') &&
        !card.tags?.includes('missing-lesson-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Lesson)
      ) {
        effects.push(HCFrameEffect.Lesson);
      }
      if (
        face.subtypes?.some(type => type.toLowerCase() == 'vehicle') &&
        !card.tags?.includes('missing-vehicle-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Vehicle)
      ) {
        effects.push(HCFrameEffect.Vehicle);
      }
    }
    if ('card_faces' in card) {
      if (
        face.layout == HCLayout.Front &&
        card.layout == HCLayout.Transform &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-transform-frame')
      ) {
        effects.push(HCFrameEffect.TransformDfc);
      } else if (
        face.layout == HCLayout.Front &&
        card.layout == HCLayout.Modal &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-modal-frame')
      ) {
        effects.push(HCFrameEffect.Mdfc);
      } else if (
        face.layout == HCLayout.Front &&
        card.layout == HCLayout.Specialize &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-specialize-frame')
      ) {
        effects.push(HCFrameEffect.Specialize);
      } else if (
        face.layout == HCLayout.Transform &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-transform-frame')
      ) {
        const effect = card.card_faces[0].frame_effects?.find(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        );
        effects.push((effect ? effect : HCFrameEffect.TransformDfc) as HCFrameEffect);
      } else if (
        face.layout == HCLayout.Modal &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-modal-frame')
      ) {
        effects.push(HCFrameEffect.Mdfc);
      } else if (
        face.layout == HCLayout.Specialize &&
        !face.frame_effects?.some(effect =>
          TransformFrameEffects.includes(effect as HCFrameEffect)
        ) &&
        !card.tags?.includes('missing-specialize-frame')
      ) {
        effects.push(HCFrameEffect.Specialize);
      }
    }
    return effects;
  };
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach(face => {
      face.colors = orderColors(face.colors) as HCColors;
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      face.mana_value = getMVFromCost(face.mana_cost);
      mana_cost_list.push(face.mana_cost);
      const effects = [...(face.frame_effects || []), ...getFrameEffectsFromFace(face)];
      if (effects.length > 0) {
        face.frame_effects = effects;
      }
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
    card.type_line = [
      card.supertypes?.join(' '),
      [card.types?.join(' '), card.subtypes?.join(' ')].filter(Boolean).join(' — '),
    ]
      .filter(Boolean)
      .join(' ') as string;
    const effects = [...(card.frame_effects || []), ...getFrameEffectsFromFace(card)];
    if (effects.length > 0) {
      card.frame_effects = effects;
    }
  }
  if (card.tags?.includes('italic-typeline')) {
    card.type_line = '*' + card.type_line + '*';
  }
  if (card.tags?.includes('underlined-typeline')) {
    card.type_line = '__' + card.type_line + '__';
  }
  const { color_identity, color_identity_hybrid } = getColorIdentityProps(card);
  card.colors = orderColors(card.colors) as HCColors;
  card.color_identity = orderColors(color_identity) as HCColors;
  card.color_identity_hybrid = color_identity_hybrid;
};
const alwaysDropLayouts: HCLayoutGroup.FaceLayoutType[] = [
  'draft_partner',
  'meld_result',
  'specialize',
];
const conditionalDropLayouts: HCLayoutGroup.FaceLayoutType[] = [
  'checklist',
  'dungeon',
  'token',
  'emblem',
  'checklist',
  'reminder',
  'misc',
  'stickers',
  'dungeon',
];
const alwaysCompressLayouts: HCLayoutGroup.FaceLayoutType[] = [
  'split',
  'aftermath',
  'prepare',
  'inset',
  'token',
  'flip',
];

export const setExportProps = (card: HCCard.Any, takenNames: string[]) => {
  if ('card_faces' in card) {
    const toFinalExportName = (name: string) => {
      let exportName = toExportName(name);
      if (card.isActualToken) {
        let i = 1;
        while (takenNames.includes(exportName + i)) {
          i++;
        }
        exportName += i;
      }
      if (exportName.startsWith('(')) {
        exportName = '_' + exportName;
      }
      if (exportName.endsWith(')')) {
        exportName += '_';
      }
      while (
        // /\(.{2,3}\)$/.test(exportName) ||
        takenNames.includes(exportName) ||
        parseInt(exportName).toString() == exportName
      ) {
        exportName += '_';
      }
      return exportName;
    };
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
    card.card_faces.forEach((face, index) => {
      if (alwaysDropLayouts.includes(face.layout)) {
        face.drop_face = true;
      } else if (conditionalDropLayouts.includes(face.layout)) {
        if (card.all_parts && card.all_parts.some(part => part.name == face.name)) {
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
      card.card_faces.forEach((face, index) => {
        if (index && !face.compress_face && !face.drop_face) {
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
          if (
            card.card_faces[i].compress_face &&
            !(conditionalDropLayouts.includes(card.card_faces[i].layout) && !index)
          ) {
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
    let exportName = toExportName(card.isActualToken ? card.id : card.name);
    if (exportName.startsWith('(')) {
      exportName = '_' + exportName;
    }
    if (exportName.endsWith(')')) {
      exportName += '_';
    }
    while (
      // /\(.{2,3}\)$/.test(exportName) ||
      takenNames.includes(exportName) ||
      parseInt(exportName).toString() == exportName
    ) {
      exportName += '_';
    }
    if (exportName != (card.isActualToken ? card.id : card.name)) {
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

const landToColorMapping = {
  Plains: 'W',
  Ploons: 'W',
  Island: 'U',
  Swamp: 'B',
  Mountain: 'R',
  Moontain: 'R',
  Forest: 'G',
  Nebula: 'P',
  // Oasis: 'Orange',
  // Mudflats: 'Brown',
  // 'Gas-Station': 'Yellow',
  // Carnival: 'Pink',
} as Record<string, HCColor>;
