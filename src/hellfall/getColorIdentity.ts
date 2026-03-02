import { HCCard } from '../api-types/Card';
import { pipsAtom } from './pipsAtom';
import { useAtomValue } from 'jotai';
import { getDefaultStore } from 'jotai';
import { HCColor, HCColors } from '../api-types/Card';
import { splitParens } from './splitParens';
const store = getDefaultStore();

export const getColorIdentity = (card: HCCard.Any) => {
  const colorIdentity = new Set<HCColors>();
  const pips = store.get(pipsAtom);
  // TODO: make color indicators work
  // TODO: special cases for Crypticspire Mantis (must be at least 2)
  card.toFaces().forEach(entry => {
    const costNames = entry.mana_cost.match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    costNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors!);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });

    const minusReminderText = splitParens(entry.oracle_text)
      .filter(e => e[0] && e[0] != '(')
      .join('');
    const textNames = (minusReminderText || '')
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1));

    textNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors!);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });

    const splitSubtypes = entry.subtypes || [];
    splitSubtypes.forEach(typeEntry => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add([mappedColor]);
      }
    });

    if ('color_indicator' in entry) {
      entry.color_indicator?.forEach(color => {
        colorIdentity.add([color]);
      });
    }
  });

  return Array.from(colorIdentity);
};

export const getColorIdentityProp = (card: HCCard.Any) => {
  const colorIdentity = new Set<HCColors>();
  const pips = store.get(pipsAtom);
  // TODO: make color indicators work
  // TODO: special cases for Crypticspire Mantis (must be at least 2)
  if ('card_faces' in card) {
    card.card_faces.forEach(entry => {
      const costNames = entry.mana_cost.match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

      costNames?.forEach(name => {
        const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
        if (pip && pip?.represents_mana) {
          colorIdentity.add(pip.colors!);
        } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            colorIdentity.add([mappedColor]);
          }
        }*/
      });

      const minusReminderText = splitParens(entry.oracle_text)
        .filter(e => e[0] && e[0] != '(')
        .join('');
      const textNames = (minusReminderText || '')
        .match(/{([^}]+)}/g)
        ?.map(match => match.slice(1, -1));

      textNames?.forEach(name => {
        const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
        if (pip && pip?.represents_mana) {
          colorIdentity.add(pip.colors!);
        } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            colorIdentity.add([mappedColor]);
          }
        }*/
      });

      const splitSubtypes = entry.subtypes || [];
      splitSubtypes.forEach(typeEntry => {
        const mappedColor = landToColorMapping[typeEntry];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      });

      if ('color_indicator' in entry) {
        entry.color_indicator?.forEach(color => {
          colorIdentity.add([color]);
        });
      }
    });
  } else {
    const costNames = card.mana_cost.match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    costNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors!);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });

    const minusReminderText = splitParens(card.oracle_text)
      .filter(e => e[0] && e[0] != '(')
      .join('');
    const textNames = (minusReminderText || '')
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1));

    textNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        colorIdentity.add(pip.colors!);
      } /*else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }*/
    });

    const splitSubtypes = card.subtypes || [];
    splitSubtypes.forEach(typeEntry => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add([mappedColor]);
      }
    });

    if ('color_indicator' in card) {
      card.color_indicator?.forEach(color => {
        colorIdentity.add([color]);
      });
    }
  }

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
} as Record<string, HCColor>;
//"{3/P}{U}",
