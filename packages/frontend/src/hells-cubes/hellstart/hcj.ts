export type HCJPackInfo = {
  name: string;
  url: string;
  tag: string;
  secondCopyOf?: string;
  // only use one of id (for hellscube cards) or name (for scryfall cards)
  lands: { count: number; name?: string; id?: string }[];
};

import {
  HCCard,
  HCLayout,
  HCLegality,
  HCColor,
  HCColors,
  HCImageStatus,
  HCObject,
} from '@hellfall/shared/types';

import { withCardMethods } from '../getHc5.ts';
import { DraftmancerCustomCard } from '../types.ts';

/** Convert pack front metadata into an HCCard.Any with toFaces() for use in getDraftMancerCard etc. */
// export function packInfoToCard(entry: HCJPackInfo): HCCard.Any {
//   const card: Omit<HCCard.Normal, 'toFaces' | 'toJSON'> = {
//     object: HCObject.ObjectType.Card,
//     id: `hcj-${entry.tag}`,
//     layout: HCLayout.Normal,
//     name: `${entry.name} - ${entry.tag}`,
//     image: entry.url,
//     image_status: HCImageStatus.HighRes,
//     mana_value: 0,
//     creators: [],
//     set: 'HCJ',
//     rulings: '',
//     type_line: 'Card',
//     oracle_text: '',
//     mana_cost: '',
//     color_identity: [HCColor.Colorless],
//     colors: [HCColor.Colorless] as HCColors,
//     keywords: [],
//     legalities: {
//       standard: HCLegality.Legal,
//       '4cb': HCLegality.Legal,
//       commander: HCLegality.Legal,
//     },
//     color_identity_hybrid: [],
//     full_image_status: HCImageStatus.Inapplicable,
//     variation: false,
//     border_color: 'black',
//     frame: '2015',
//     finish: 'nonfoil',
//   };
//   return withCardMethods(card as HCCard.Normal);
// }
export const packInfoToCard = (entry: HCJPackInfo): DraftmancerCustomCard => {
  return {
    name: `${entry.name} - ${entry.tag}`,
    mana_cost: '',
    type: 'Card',
    image: entry.url,
  } as DraftmancerCustomCard;
};

export const hcjFrontCards: HCJPackInfo[] = [
  {
    name: 'Adventures',
    url: 'https://lh3.googleusercontent.com/d/1hyM35n3DdwWA9rW_5b2pacCx9-zPxMZo',
    tag: 'adventures-pack',
    secondCopyOf: '5783',
    lands: [
      { count: 6, id: '5982' },
      { count: 1, name: 'Thriving Heath' },
    ],
  },
  {
    name: 'Lockdown in Space',
    url: 'https://lh3.googleusercontent.com/d/1gwxgcVVkazey7NXuaVnVs9EtSN89Fc-i',
    tag: 'lockdown-control-in-space-pack',

    secondCopyOf: '5788',
    lands: [
      { count: 6, id: '6084' },
      { count: 1, name: 'Thriving Heath' },
    ],
  },
  {
    name: 'Garfield',
    url: 'https://lh3.googleusercontent.com/d/1FQVqg2G4q6EUr8XeD1MgW2gv1HqRwD_N',
    tag: 'garfield-pack',
    secondCopyOf: '5795',
    lands: [{ count: 6, name: 'Plains' }],
  },
  {
    name: 'Steven',
    url: 'https://lh3.googleusercontent.com/d/1eiCoNtc0VVxpiwWEVL3goTZBN97sGMPz',
    tag: 'steven-pack',
    lands: [{ count: 6, id: '5934' }],
  },
  {
    name: 'Vehicles',
    url: 'https://lh3.googleusercontent.com/d/1s3zmrLhrWshArA_AUU1j2YfYKhFTXzjF',
    tag: 'vehicles-pack',

    secondCopyOf: '5807',
    lands: [
      { count: 6, id: '5921' },
      { count: 1, name: 'Thriving Heath' },
    ],
  },
  {
    name: 'Storm Spellslinger',
    url: 'https://lh3.googleusercontent.com/d/18N8NkqPrhuY5Kynyyl8TX4hnif7OMY6V',
    tag: 'storm-spellslinger-pack',

    secondCopyOf: '5785',
    lands: [
      { count: 5, name: 'Island' },
      { count: 1, name: 'Thriving Isle' },
    ],
  },
  {
    name: 'Clues',
    url: 'https://lh3.googleusercontent.com/d/1x1-wy-nGrqhGInssxrMdYi2MSoGo-u4L',
    tag: 'clues-pack',
    secondCopyOf: '6246',
    lands: [
      { count: 6, name: 'Island' },
      { count: 1, name: 'Thriving Isle' },
    ],
  },
  {
    name: 'Time Travel',
    url: 'https://lh3.googleusercontent.com/d/1vtd2o1_HsKg-arIOmBRTipG32q7ga0oe',
    tag: 'time-travel-pack',

    secondCopyOf: '5801',
    lands: [
      { count: 6, id: '5920' },
      { count: 1, name: 'Thriving Isle' },
    ],
  },
  {
    name: 'Zones',
    url: 'https://lh3.googleusercontent.com/d/142lGsUITRtfyfiXNCGK3M_52SSk0sXmL',
    tag: 'zones-pack',

    secondCopyOf: '5806',
    lands: [
      { count: 6, name: 'Island' },
      { count: 1, name: 'Thriving Isle' },
    ],
  },
  {
    name: 'Mill Crabs',
    url: 'https://lh3.googleusercontent.com/d/12cTVO9f3NGEE-Wb9C0jw2Ukyozm55YkB',
    tag: 'mill-crabs-pack',

    secondCopyOf: '5810',
    lands: [{ count: 6, id: '7328' }],
  },
  {
    name: 'HELL',
    url: 'https://lh3.googleusercontent.com/d/1-ciDmLhErAlhT_0BP7bsDNO6iKkyjZNA',
    tag: 'HELL-pack',
    secondCopyOf: '5784',
    lands: [
      { count: 3, id: '5993' },
      { count: 3, id: '6018' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Facedown',
    url: 'https://lh3.googleusercontent.com/d/1SH7FZcwZWR9BkSpAASaRnauDfSuAsKLW',
    tag: 'face-down-pack',
    secondCopyOf: '5786',
    lands: [
      { count: 6, id: '5911' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Crime',
    url: 'https://lh3.googleusercontent.com/d/1mDRKD_QRi7wGhzd8_qBSaU7PAVcGrdMN',
    tag: 'crime-pack',
    secondCopyOf: '5790',
    lands: [
      { count: 6, name: 'Swamp' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Aristocrats',
    url: 'https://lh3.googleusercontent.com/d/1WnyJ4Zt5XDf1xaaTogynJClaqLkGO_66',
    tag: 'aristocrats-pack',
    secondCopyOf: '5803',
    lands: [
      { count: 6, name: 'Swamp' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Contraptions',
    url: 'https://lh3.googleusercontent.com/d/18HE_D6hsP91OvkjsnYqM3vXtFZhzcPpu',
    tag: 'contraptions-pack',
    secondCopyOf: '6228',
    lands: [
      { count: 6, id: '5909' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Red Deck Wins',
    url: 'https://lh3.googleusercontent.com/d/14I7o5Ixapn8nsYg8KuZTCb2WmEp0jzjC',
    tag: 'red-deck-wins-pack',

    secondCopyOf: '5777',
    lands: [
      { count: 6, id: '6218' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Gambling',
    url: 'https://lh3.googleusercontent.com/d/1JPbWDgfvF5ly39PaF6GVg0NWf_eIjsBE',
    tag: 'gambling-pack',
    secondCopyOf: '5794',
    lands: [{ count: 6, id: '6216' }],
  },
  {
    name: 'Blitz',
    url: 'https://lh3.googleusercontent.com/d/1KgJoBpj64xqPX1IbCFZ7cOIVHig_jFpJ',
    tag: 'blitz-pack',
    secondCopyOf: '5780',
    lands: [
      { count: 6, name: 'Mountain' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Fling',
    url: 'https://lh3.googleusercontent.com/d/1luuDW4lrwASivn-iWMrl7k8XaYdhpd2W',
    tag: 'fling-pack',
    lands: [
      { count: 6, id: '5979' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Haste',
    url: 'https://lh3.googleusercontent.com/d/1qRBtdNIXYqoXfh2ZGUxFCssLL9RCEhDu',
    tag: 'haste-pack',
    secondCopyOf: '5808',
    lands: [
      { count: 6, name: 'Mountain' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Grunch',
    url: 'https://lh3.googleusercontent.com/d/1quD1u2xm3vJeuYRGzCadqsNKWxgOexA9',
    tag: 'grunch-pack',
    secondCopyOf: '6131',
    lands: [
      { count: 6, id: '5952' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'Self-Discard',
    url: 'https://lh3.googleusercontent.com/d/13e0fZCdItnKvdrdAxmCIh7_QcQRiTuGv',
    tag: 'self-discard-pack',
    secondCopyOf: '5796',
    lands: [
      { count: 6, name: 'Forest' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: '🐴',
    url: 'https://lh3.googleusercontent.com/d/1d6dmP9gGIpJz9ePg4pdtdS_dY_wgMP0T',
    tag: '🐴-pack',
    secondCopyOf: '5798',
    lands: [
      { name: 'Forest', count: 6 },
      { name: 'Thriving Grove', count: 1 },
    ],
  },
  {
    name: 'Goyftext',
    url: 'https://lh3.googleusercontent.com/d/1f-_EBV-iFUYO-0WTt3iWu-Xupgvp5HxI',
    tag: 'goyftext-pack',
    secondCopyOf: '5799',
    lands: [
      { count: 6, id: '5971' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'Stompy',
    url: 'https://lh3.googleusercontent.com/d/14KUBGP6j8AVIiOYhHARZ-fHcWOBMn1Nd',
    tag: 'stompy-pack',
    secondCopyOf: '5800',
    lands: [
      { count: 6, name: 'Forest' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: '"Bant" Thopters',
    url: 'https://lh3.googleusercontent.com/d/145LwYy2eeCLDcw5Io3Wz_D2oaNWn17y4',
    tag: '"bant"-thopters-pack',
    secondCopyOf: '5804',
    lands: [
      { count: 2, id: '5981' },
      { count: 3, name: 'Plains' },
      { count: 1, name: 'Thriving Heath' },
      { count: 1, name: 'Thriving Isle' },
    ],
  },
  {
    name: 'Stealing',
    url: 'https://lh3.googleusercontent.com/d/1qy5MB3i1xite8BIzTCUvXMVqspb6NWlO',
    tag: 'stealing-pack',
    secondCopyOf: '5805',
    lands: [
      { count: 3, name: 'Island' },
      { count: 3, id: '6235' },
      { count: 1, name: 'Thriving Isle' },
      { count: 1, name: 'Thriving Moor' },
    ],
  },
  {
    name: 'Minigames',
    url: 'https://lh3.googleusercontent.com/d/1iAV3jrlzIqE-5OX6vzxc1Q1SFzybgLTS',
    tag: 'minigames-pack',
    secondCopyOf: '5833',
    lands: [
      { count: 3, id: '5959' },
      { count: 3, id: '5953' },
      { count: 1, name: 'Thriving Moor' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Junkfood',
    url: 'https://lh3.googleusercontent.com/d/1JgpJdvsytqqVvj9kMsysso9LTzb0cG68',
    tag: 'junk-food-pack',
    secondCopyOf: '5789',
    lands: [
      { count: 3, name: 'Forest' },
      { count: 3, id: '5922' },
      { count: 1, name: 'Thriving Bluff' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'Timepiecewolves',
    url: 'https://lh3.googleusercontent.com/d/13eppx14uJ_tj2hXRGDpwXl41WQ8-WzdL',
    tag: 'timepiecewolves-pack',
    secondCopyOf: '5787',
    lands: [
      { count: 3, id: '6243' },
      { count: 3, id: '6245' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'GX',
    url: 'https://lh3.googleusercontent.com/d/16w50A6KJZFKa6UvlnnqOmkd0v7TlH9KE',
    tag: 'GX-pack',
    secondCopyOf: '5802',
    lands: [
      { count: 3, id: '5894' },
      { count: 3, id: '5888' },
    ],
  },
  {
    name: 'It That',
    url: 'https://lh3.googleusercontent.com/d/1troxStiHBNLbX8q54xKz6N9nJuVC1VkO',
    tag: 'it-that-pack',
    secondCopyOf: '5791',
    lands: [
      { count: 3, id: '5945' },
      { count: 3, name: 'Swamp' },
      { count: 1, name: 'Thriving Moor' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'Posts',
    url: 'https://lh3.googleusercontent.com/d/1YCMm4MxXIsX_DUdlYQsPslVlf6ePjxUH',
    tag: 'posts-pack',

    secondCopyOf: '5782',
    lands: [
      { count: 2, name: 'Island' },
      { count: 2, name: 'Forest' },
      { count: 1, name: 'Thriving Isle' },
      { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    name: 'Toxic Yaoi',
    url: 'https://lh3.googleusercontent.com/d/151a01MZ54j3nx_Cxgso2ez3myFMLXv0a',
    tag: 'toxic-yaoi-pack',
    secondCopyOf: '5781',
    lands: [
      { count: 3, id: '5896' },
      { count: 3, id: '5886' },
      { count: 1, name: 'Thriving Isle' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Hand Tokens',
    url: 'https://lh3.googleusercontent.com/d/18DzEmctgfQ3Jjgcy9hv3WABbrHhnRZdE',
    tag: 'hand-tokens-pack',
    secondCopyOf: '5792',
    lands: [
      { count: 3, name: 'Mountain' },
      { count: 3, name: 'Plains' },
      { count: 1, name: 'Thriving Heath' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    name: 'Phases',
    url: 'https://lh3.googleusercontent.com/d/1I5EbiJTSgpe9ZSXWwz0Izi6v9saQqGo0',
    tag: 'phases-pack',

    secondCopyOf: '5809',
    lands: [{ count: 6, id: '6160' }],
  },
  {
    name: 'Urzatron',
    url: 'https://lh3.googleusercontent.com/d/1RCywujUvML1StyynlHAd6d8sRsM-lYAf',
    tag: 'urzatron-pack',
    secondCopyOf: 'Urzodia, God Of Tron',
    lands: [{ count: 3, id: '5797' }],
  },
  {
    name: `e̶̬͋̾ ̸͖̏͛c̵͈̞̒ọ̸̉l̶̨̡̍ ̵̥̾f̴̹͚̔̌i̴̖͇̅̊v̷̳̣̿v̴̨̄ͅv̷͈͌̊v̷̡̅̇v̷͕́ỏ̴̫͖̓r̴̪̄`,
    url: 'https://lh3.googleusercontent.com/d/1qjtclWmaMbhuMrf3IR7LV6dCkd2-xD5a',
    tag: '5-color-pack',

    lands: [
      { count: 1, name: 'Island' },
      { count: 1, name: 'Swamp' },
      { count: 1, name: 'Thriving Heath' },
      { count: 1, name: 'Thriving Isle' },
      { count: 1, name: 'Thriving Moor' },
      { count: 1, name: 'Thriving Bluff' },
      { count: 3, name: 'Thriving Grove' },
    ],
  },
];
