import { HCEntry } from '../../types';
import { HCCard } from '../../api-types';
import { DraftmancerCard } from '../types';

export const getDraftMancerCard = (card: HCCard.Any) => {
  const cardToReturn: DraftmancerCard = {
    id: card.name.replace(' :]', '') + '_custom_',
    oracle_id: card.name.replace(':]', '').trim(),
    name: card.name.replace(':]', '').trim(),
    // This prefers replaceAll for static strings
    mana_cost: (card.toFaces()[0].mana_cost || '')
      .replace(/\{\?\}/g, '{0}')
      .replace('?', '{0}')
      .replace(/\{H\/.\}/g, '') // TODO do the stringreplace and try ta actually set the number
      .replace(/\{(.)\/(.)(\/(.))+\}/g, '{$1/$2}')
      .replace('{9/3}', '{3}')
      .replace('{-1}', '{0}')
      .replace(/\{U\/O\}/g, '{U}') // Cat with homophobia
      .replace(/\{.\/(.)\}/g, '{$1}') // This one seems wrong
      .replace(/\{Pickle\}/g, '{G}') // Pickle Krrik
      .replace(/\{U\/BB\}/g, '{U/B}')
      .replace('{Brown}', '{1}')
      .replace('{Piss}', '{1}')
      .replaceAll('{Blood}', '{0}') // More than a few cards with multiple blood
      .replace('{2/Brown}', '{2}') // Blonk
      .replace('Sacrifice a creature:', '{0}')
      .replace('{Discard your hand/RR}', '{R}{R}') // Dumpstergoyf
      .replace('{BB/P}', '{B}{B}') //THE SKELETON
      .replace('{UU/P}', '{U}{U}')
      .replace('{2/Piss}', '{2}')
      .replace(/\{(\d)\/(Pink|Yellow)\}/g, '{$1}') // It that Goes in the Green Slot, and some other card, and some other card
      .replace(/\{H([^/])\}/g, '{$1}') // Half mana {HU} = half blue
      .replaceAll('{TEMU}', '{1}')
      .replaceAll('{H/Brown}', '{1}') // It that Goes in the Green Slot
      .replaceAll('{G/Yellow/P}', '{G}'), // It that Goes in the Green Slot

    colors: card.toFaces()[0].colors,
    set: 'custom',
    collector_number: '',
    rarity: 'rare',
    type: `${card.toFaces()[0].supertypes?.join(" ")} ${card.toFaces()[0].types?.join(" ")}`.trim(),
    subtypes: card.toFaces()[0].subtypes?.filter(e => e != '') || [],
    rating: 0,
    in_booster: true,
    oracle_text: card.toFaces().map(e=>e.oracle_text).filter(Boolean).join('\n').replace(/:\[/g, ''),

    printed_names: {
      en: card.name.replace(' :]', ''), // Six Flags
    },
    image_uris: { en:  'card_faces' in card && card.card_faces[0].image
                ? card.card_faces[0].image
                : card.image! },
    is_custom: true,
    ...getDraftEffects(card),
    ...(card.toFaces().length > 1 && {
      backs: card.toFaces().slice(1).map(e=>({
        name: e.name,
        image_uris: {en:e.image!},
        type: e.type_line,
      }))
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
    card.toFaces()[0].oracle_text.toLowerCase().includes('as you draft')
  );
};