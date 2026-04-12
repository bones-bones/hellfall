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
import { splitParens } from '@hellfall/shared/utils/textHandling.ts';
import { getPipsData } from '@hellfall/shared/services/pipsService.ts';

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

    if ('color_indicator' in face) {
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
        face.supertypes?.includes('Legendary') &&
        !face.types?.includes('Planeswalker') &&
        !card.tags?.includes('missing-legend-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Legendary)
      ) {
        effects.push(HCFrameEffect.Legendary);
      }
      if (
        face.supertypes?.includes('Snow') &&
        !card.tags?.includes('missing-snow-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Snow)
      ) {
        effects.push(HCFrameEffect.Snow);
      }
      if (
        face.subtypes?.includes('Lesson') &&
        !card.tags?.includes('missing-lesson-frame') &&
        !face.frame_effects?.includes(HCFrameEffect.Lesson)
      ) {
        effects.push(HCFrameEffect.Lesson);
      }
      if (
        face.subtypes?.includes('Vehicle') &&
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
        !face.frame_effects?.includes(HCFrameEffect.Mdfc)
      ) {
        effects.push(HCFrameEffect.Mdfc);
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
        !face.frame_effects?.includes(HCFrameEffect.Mdfc)
      ) {
        effects.push(HCFrameEffect.Mdfc);
      }
    }
    return effects;
  };
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach(face => {
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
  const { color_identity, color_identity_hybrid } = getColorIdentityProps(card);
  card.color_identity = color_identity;
  card.color_identity_hybrid = color_identity_hybrid;
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
  Swamp: 'B',
  Island: 'U',
  // IslandGX: 'Blue', // TODO: I have sinned
  Mountain: 'R',
  Moontain: 'R',
  Forest: 'G',
  Nebula: 'P',
  // Oasis: 'Orange',
  // Mudflats: 'Brown',
  // 'Gas-Station': 'Yellow',
  // Carnival: 'Pink',
} as Record<string, HCColor>;
