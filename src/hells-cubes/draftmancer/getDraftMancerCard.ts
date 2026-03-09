import { HCCard } from '../../api-types';
import { DraftmancerCard } from '../types';

export const getDraftMancerCard = (card: HCCard.Any) => {
  const draftmancerSafeName = card.name.replace(/[[\]]/g, '');
  const cardToReturn: DraftmancerCard = {
    id: draftmancerSafeName + '_custom_',
    oracle_id: draftmancerSafeName,
    name: draftmancerSafeName,
    // This prefers replaceAll for static strings
    mana_cost: (card.mana_cost || '')
      .replaceAll(/\{\?\}/g, '{0}')
      .replaceAll('?', '{0}')
      .replace(/\{H\/.\}/g, '') // nut Shot (TODO do the stringreplace and try ta actually set the number)
      .replace(/\{(.)\/(.)(\/(.))+\}/g, '{$1/$2}')
      .replace('{9/3}', '{3}') // Yargle, Yargle Yargle Yargle
      .replace('{-1}', '{0}') // Negative Man
      .replace(/\{U\/O\}/g, '{U}') // Cat with homophobia
      .replace(/\{.\/(.)\}/g, '{$1}') // Pyrohyperspasm
      .replace(/\{Pickle\}/g, '{G}') // Pickle Krrik
      .replace(/\{U\/BB\}/g, '{U/B}') // Murder of Storm Crows
      .replace('{Brown}', '{1}')
      .replace('{Yellow}', '{1}')
      .replaceAll('{Blood}', '{0}') // Ouroboros
      .replace('{2/Brown}', '{2}') // Blonk
      .replace('Sacrifice a creature:', '{0}') // Cat
      .replace('{Discard your hand/RR}', '{R}{R}') // Dumpstergoyf
      .replace('{BB/P}', '{B}{B}') // THE SKELETON
      .replace('{UU/P}', '{U}{U}') // Orb Enthusiast
      .replace('{2/Yellow}', '{2}')
      .replace(/\{(\d)\/(Pink|Yellow)\}/g, '{$1}') // It that Goes in the Green Slot, and some other card, and some other card
      .replace(/\{H([^/])\}/g, '{$1}') // nut Shot (Half mana {HU} = half blue)
      .replaceAll('{TEMU}', '{1}') // TEMU Sabertooth
      .replaceAll('{H/Brown}', '{1}') // It that Goes in the Green Slot
      .replaceAll('{G/Yellow/P}', '{G}') // It that Goes in the Green Slot
      .replaceAll('{UFO}', '{1}') // Gitaxian Satellite
      .replaceAll('{Coin}', '{1}')
      .replaceAll('{27}', '{11}{11}{6}') // Block of Darksteel
      .replaceAll('{2/Orange}', '{2}') // Candy Karn
      .replaceAll('{Orange/U}', '{U}'), // Cat with homophobia

    colors: card.toFaces()[0].colors,
    set: 'custom',
    collector_number: '',
    rarity: 'rare',
    type: [card.toFaces()[0].supertypes?.join(' '), card.toFaces()[0].types?.join(' ')].join(' ').trim(),
    subtypes: card.toFaces()[0].subtypes?.filter(e => e != '') || [],
    rating: 0,
    in_booster: true,
    oracle_text: card
      .toFaces()
      .map(e => e.oracle_text)
      .filter(Boolean)
      .join('\n')
      .replace(/:\[/g, ''),

    printed_names: {
      en: draftmancerSafeName,
    },
    image_uris: {
      en: 'card_faces' in card && card.card_faces[0].image ? card.card_faces[0].image : card.image!,
    },
    is_custom: true,
    ...getDraftEffects(card),
    ...('card_faces' in card && {
      backs: card
        .toFaces()
        .slice(1)
        .map(e => ({
          name: e.name.replace(/[[\]]/g, ''),
          image_uris: { en: e.image! },
          type: e.type_line,
        })),
    }),
  };
  return cardToReturn;
};

const getDraftEffects = (card: HCCard.Any) => {
  const specificCard = cardSpecificControl(card);
  if (specificCard) {
    return { draft_effects: specificCard };
  }
  if (shouldReveal(card)) {
    return { draft_effects: ['FaceUp'] };
  }
};

const cardSpecificControl = (card: HCCard.Any) => {
  switch (card.name) {
    case 'Cheatyspace': {
      return ['FaceUp', 'CogworkLibrarian'];
    }
    case 'Moe, Pursuant of Wisdom': {
      return [
        'FaceUp',
        {
          type: 'AddCards',
          cards: ['Larry, Pure of Action', 'Curly, Focused of Mind'],
        },
      ];
    }
    case 'Draft Horse': {
      return ['FaceUp', 'CogworkGrinder'];
    }
  }
};

const shouldReveal = (card: HCCard.Any) => {
  return (
    card.toFaces()[0].oracle_text.includes('hen you draft') ||
    card.toFaces()[0].oracle_text.includes('raftpartner') ||
    card.toFaces()[0].oracle_text.includes('s you draft')
  );
};
