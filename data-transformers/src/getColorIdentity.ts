import { HCCard, HCCardFace, HCLayoutGroup } from '../../src/api-types/Card';
import { pipsAtom } from '../../src/hellfall/atoms/pipsAtom';
import { getDefaultStore } from 'jotai';
import { HCColor, HCColors } from '../../src/api-types/Card';
import { splitParens } from '../../src/hellfall/splitParens';
const store = getDefaultStore();

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
      if (
        !colorIdentityHybrid.some(colorSet => colorSet.every(color => colors.includes(color)))
      ) {
        for (let i = colorIdentityHybrid.length - 1; i >= 0; i--) {
          // if the new colorSet is completely inside the existing colorSet, delete the existing one
          if (colors.every(color => colorIdentityHybrid[i].includes(color))) {
            colorIdentityHybrid.splice(i,1);
          }
        }
        colorIdentityHybrid.push(colors);
      }
    }
  };
  const pips = store.get(pipsAtom);
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
    if (
      HCLayoutGroup.FrontIdentityLayout.includes(
        card.layout as HCLayoutGroup.FrontIdentityLayoutType
      )
    ) {
      card.card_faces.slice(0, -1).forEach(entry => {
        addColorsFromFace(entry);
      });
    } else {
      if (card.id == '3646') {
        const x = 1;
      }
      card.card_faces.forEach(entry => {
        addColorsFromFace(entry);
      });
    }
  } else {
    addColorsFromFace(card);
  }
  // if (colorIdentity.size == 0) {
  //   colorIdentity.add('C');
  // } else if (colorIdentity.size > 1 && colorIdentity.has('C')) {
  //   colorIdentity.delete('C');
  // }
  return {
    color_identity: Array.from(colorIdentity) as HCColors,
    color_identity_hybrid: colorIdentityHybrid
  };
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
  Oasis: 'Orange',
  Mudflats: 'Brown',
  'Gas-Station': 'Yellow',
  Carnival: 'Pink',
} as Record<string, HCColor>;
