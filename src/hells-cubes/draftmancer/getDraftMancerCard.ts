import { HCEntry } from '../../types';
import { DraftmancerCard } from '../types';

export const getDraftMancerCard = (card: HCEntry) => {
  const cardToReturn: DraftmancerCard = {
    id: card.Name.replace(' :]', '') + '_custom_',
    oracle_id: card.Name.replace(':]', '').trim(),
    name: card.Name.replace(':]', '').trim(),
    // This prefers replaceAll for static strings
    mana_cost: (card.Cost?.[0] || '')
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

    // @ts-ignore
    colors: card['Color(s)']?.split(';').map(colorToDraftMancerColor),
    set: 'custom',
    collector_number: '',
    rarity: 'rare',
    type: `${card['Supertype(s)']?.[0]?.replace(/;/g, ' ')} ${card['Card Type(s)']?.[0]?.replace(
      /;/g,
      ' '
    )}`.trim(),
    subtypes: card['Subtype(s)']?.[0]!.split(';').filter(e => e != '') || [],
    rating: 0,
    in_booster: true,
    oracle_text: card['Text Box']?.filter(Boolean).join('\n').replace(/:\[/g, ''),

    printed_names: {
      en: card.Name.replace(' :]', ''), // Six Flags
    },
    image_uris: { en: card.Image[1] || card.Image[0]! },
    is_custom: true,
    ...getDraftEffects(card),
    ...(card.Image[2] &&
      !card.Image[3] && {
        back: {
          name: card.Name.split(' // ')[1] || '',
          image_uris: { en: card.Image[2]! },
          type: `${card['Supertype(s)']?.[1]?.replace(/;/g, ' ')} ${card[
            'Card Type(s)'
          ]?.[1]?.replace(/;/g, ' ')}`.trim(),
        },
      }),
  };
  return cardToReturn;
};

const getDraftEffects = (card: HCEntry) => {
  const specificCard = cardSpecificControl(card);
  if (specificCard) {
    return { draft_effects: specificCard };
  }
  if (shouldReveal(card)) {
    return { draft_effects: ['FaceUp'] };
  }
};

const cardSpecificControl = (card: HCEntry) => {
  switch (card.Name) {
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

const shouldReveal = (card: HCEntry) => {
  return (
    card['Text Box']?.[0]?.includes('hen you draft') ||
    card['Text Box']?.[0]?.includes('raftpartner') ||
    card['Text Box']?.[0]?.toLowerCase().includes('as you draft')
  );
};

const colorToDraftMancerColor = (color: string) => {
  switch (color) {
    case 'Red':
      return 'R';
    case 'White':
      return 'W';
    case 'Blue':
      return 'U';
    case 'Black':
      return 'B';
    case 'Green':
      return 'G';
    default:
      return '';
  }
};
