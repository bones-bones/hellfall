import {
  HCCard,
  HCImageStatus,
  HCKind,
  HCObject,
  HCRelatedCard,
  SetCode,
} from '@hellfall/shared/types';
import { addToJSONToCard, CardMap, getDefaultCard, setDerivedProps } from '@hellfall/shared/utils';

export type HCJPackInfo = {
  id: string;
  oracle_id: string;
  name: string;
  url: string;
  tag: string;
  secondCopyOf?: string;
  // only use one of id (for hellscube cards) or name (for scryfall cards)
  lands: { count: number; name?: string; id?: string }[];
};

export const packInfoToCard = (entry: HCJPackInfo): HCCard.Front =>
  addToJSONToCard(
    getDefaultCard(
      HCKind.Front,
      false,
      {
        id: entry.id,
        oracle_id: entry.oracle_id,
        hcid: `fhcj-${entry.tag}`,
        name: `${entry.name} - ${entry.tag}`,
        set: 'FHCJ',
        image: entry.url,
        image_status: HCImageStatus.HighRes,
        type_line: 'Front Card',
      },
      {
        types: ['Front Card'],
      }
    )
  ) as HCCard.Front;

export const fetchHCJFronts = (): CardMap =>
  new CardMap(
    hcjFrontCards.map((pack, i) => {
      const front = packInfoToCard(pack);
      front.collector_number = `${i + 1}`;
      front.all_parts = pack.lands.map(land => {
        const part: HCRelatedCard = {
          object: HCObject.ObjectType.RelatedCard,
          id: '',
          oracle_id: '',
          hcid: land.id ?? '',
          name: land.name ?? '',
          set: '' as SetCode,
          collector_number: '',
          type_line: '',
          component: 'draft_partner',
          is_draft_partner: true,
        };
        if (land.count > 1) {
          part.count = `${land.count}`;
        }
        return part;
      });
      if (pack.secondCopyOf) {
        front.all_parts.push({
          object: HCObject.ObjectType.RelatedCard,
          id: '',
          oracle_id: '',
          hcid: pack.secondCopyOf,
          name: '',
          set: 'HCJ',
          collector_number: '',
          type_line: '',
          component: 'draft_partner',
          is_draft_partner: true,
          count: '2',
        });
      }
      setDerivedProps(front, [pack.tag, 'BurnAfterPicking']);
      return front;
    })
  );

export const hcjFrontCards: HCJPackInfo[] = [
  {
    id: '3fe031a1-95e7-4c9f-92d5-4c7a6ba1db5e',
    oracle_id: '3e3f594d-a780-4220-ac8e-8ac8073d8afc',
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
    id: '8d27844b-e1e8-4d26-8d1e-8ea611cf65af',
    oracle_id: '2e078baa-8435-41c3-b115-8d0f13af20cf',
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
    id: 'acf0c436-075e-4573-838c-2d3b2bf6178f',
    oracle_id: '51ecf607-646d-44c8-a37f-c8b1d3ce5bf7',
    name: 'Garfield',
    url: 'https://lh3.googleusercontent.com/d/1FQVqg2G4q6EUr8XeD1MgW2gv1HqRwD_N',
    tag: 'garfield-pack',
    secondCopyOf: '5795',
    lands: [{ count: 6, name: 'Plains' }],
  },
  {
    id: '89a67d33-25bc-454b-bd4a-8f2ea195a5cd',
    oracle_id: 'a6b2592a-2071-4aa5-be56-31ad850a524e',
    name: 'Steven',
    url: 'https://lh3.googleusercontent.com/d/1eiCoNtc0VVxpiwWEVL3goTZBN97sGMPz',
    tag: 'steven-pack',
    lands: [{ count: 6, id: '5934' }],
  },
  {
    id: 'a8b14819-a62e-4591-a11b-98cbddbd5048',
    oracle_id: 'f3b83655-b097-4bcc-8055-1eca279a36e5',
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
    id: '1f5288d0-5c61-4f7d-a6f0-0f280d3b36a3',
    oracle_id: '25b602e8-34c7-4eab-85a3-176ae903d198',
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
    id: '715149dc-7d52-436c-a06a-a43533a646bc',
    oracle_id: '491a4207-3e41-4e0e-8150-f270d34146e3',
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
    id: '4ce3bf7b-f576-4702-aaaa-7b7599bd8b34',
    oracle_id: 'e6b99ac8-205a-4747-869c-2f12095f3c3b',
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
    id: '8d4bbf2e-9f04-491d-9cd6-b6075a3afc41',
    oracle_id: '09155580-d771-4cdf-81c1-4a69a2f8a547',
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
    id: 'e0623ea0-e8e2-4830-b47e-fa70e2350bbb',
    oracle_id: '5bd08c36-6063-4dcb-822c-91f0afbf0474',
    name: 'Mill Crabs',
    url: 'https://lh3.googleusercontent.com/d/12cTVO9f3NGEE-Wb9C0jw2Ukyozm55YkB',
    tag: 'mill-crabs-pack',
    secondCopyOf: '5810',
    lands: [{ count: 6, id: '7328' }],
  },
  {
    id: 'f8fe9e44-44ed-4ba3-bbf2-defa67f278bc',
    oracle_id: '01699d1e-c3ce-4696-8cae-145ac8728864',
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
    id: 'a4b6d9e1-3bb0-4bfe-a02d-45d107788be3',
    oracle_id: '0c8f5ca5-4f87-4802-90a6-92d18df6835a',
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
    id: '647792b4-983d-4b52-bbb5-28337f5e06e5',
    oracle_id: '13ca6f36-ebb6-4c53-9c38-b0ddf8bcf3f9',
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
    id: '4307daf7-d354-4d5f-b5f2-0aafb90315f8',
    oracle_id: '1de14f1c-d233-404d-b0a9-4e47fce2f513',
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
    id: '5a916cac-c29c-408a-b5b4-decaa52130f0',
    oracle_id: '6beabaa9-8d21-42f6-985a-a647c6291d63',
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
    id: 'd327473d-bce8-4b85-96d9-b189f3ef9610',
    oracle_id: 'f1eca054-f107-4db0-9bbc-6880bf540f71',
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
    id: '272c7384-4969-4d7b-979d-9c3a361a4459',
    oracle_id: 'fe713447-cffc-43cb-ad7b-7b1618824de4',
    name: 'Gambling',
    url: 'https://lh3.googleusercontent.com/d/1JPbWDgfvF5ly39PaF6GVg0NWf_eIjsBE',
    tag: 'gambling-pack',
    secondCopyOf: '5794',
    lands: [{ count: 6, id: '6216' }],
  },
  {
    id: 'eaec6e3c-cb27-40b7-ae92-1d8677a37736',
    oracle_id: '31daecc4-c821-4164-a460-393abe40005f',
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
    id: '2cb9cc18-ee69-40db-a99e-440a973b35f5',
    oracle_id: 'c54f4bb6-601a-4ca2-935c-351b7499f3c5',
    name: 'Fling',
    url: 'https://lh3.googleusercontent.com/d/1luuDW4lrwASivn-iWMrl7k8XaYdhpd2W',
    tag: 'fling-pack',
    lands: [
      { count: 6, id: '5979' },
      { count: 1, name: 'Thriving Bluff' },
    ],
  },
  {
    id: 'e85b0300-a8cc-4208-8003-e49d6b170b75',
    oracle_id: 'bc93f1d8-a1b6-4644-a47e-d39cd6593e2e',
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
    id: '7476bb63-ec9f-4485-bb12-22483043b4ef',
    oracle_id: 'ba18ce6d-5cf0-4843-9b56-ee15240db210',
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
    id: '8d486396-eca7-42e0-ac10-5643c1042d28',
    oracle_id: '23fa3e3b-2baf-4b8c-b4ba-35c4ef275a63',
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
    id: '03a9c752-6e1d-4857-a608-554375b0e5e2',
    oracle_id: '352d1330-198e-4c9b-a410-40f55322449f',
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
    id: 'ad19f18d-64d4-40ba-9cdf-5f09752dda5e',
    oracle_id: '4600bdea-acb4-4a2f-81ed-614a70283fcb',
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
    id: 'a873a87a-3d4e-4ab9-bfe0-4e8d1c4ac7d7',
    oracle_id: 'daba6610-6ce3-49cf-a90e-ea215dd3deaf',
    name: 'Stompy',
    url: 'https://lh3.googleusercontent.com/d/14KUBGP6j8AVIiOYhHARZ-fHcWOBMn1Nd',
    tag: 'stompy-pack',
    secondCopyOf: '5800',
    lands: [
      { count: 6, name: 'Forest' },
      // { count: 1, name: 'Thriving Grove' },
    ],
  },
  {
    id: 'f8ae78cb-e370-4320-bb17-04d13d4ec865',
    oracle_id: '8b9d8b57-7a05-4259-bf78-064013392b64',
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
    id: '99de711e-1017-4a4e-a507-50b29b72758e',
    oracle_id: '21e69784-9bf4-4088-b987-8dfeee0bb5db',
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
    id: '8cdc44f6-8ae2-480c-8c6e-6589f727353b',
    oracle_id: '7ec179e8-9837-431a-a720-88ffdb3ddb49',
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
    id: '712f7bcb-4716-4f98-87d5-b8019c4ca375',
    oracle_id: 'c4857850-783f-4d05-be0d-6601b97ae4a4',
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
    id: 'd4194fec-980a-406a-85df-08685bc3411d',
    oracle_id: '5592a6c0-b5ff-4ec8-9390-f0ea430f8e75',
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
    id: 'f3626a39-b8f3-4ec0-89cc-909ddbd3fe3b',
    oracle_id: '99473d68-3aba-4c98-abf6-4b0ba16efdd1',
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
    id: 'aaeb8204-aed0-4f92-a91c-1578e17eff04',
    oracle_id: '0a9c40d6-db45-4713-ae9a-a38072cd41da',
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
    id: '7a9e0711-fb71-4316-8169-4749a7c7cc14',
    oracle_id: '9b91d790-0a93-4792-9e9b-b8e9bc95d775',
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
    id: '3b220e96-ce56-4265-87cf-7ddb86122038',
    oracle_id: '66d9b7f5-cfd4-4b83-8e0b-345600820d74',
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
    id: '6c91f032-5789-47c0-9993-357e6d4bb9d6',
    oracle_id: '19928553-8b60-413d-b840-2de3b1b92f4a',
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
    id: '330f82b9-b224-4f39-89fe-4b7472e97edd',
    oracle_id: 'aca440d3-8c2e-4e1d-8597-0f108458ca9f',
    name: 'Phases',
    url: 'https://lh3.googleusercontent.com/d/1I5EbiJTSgpe9ZSXWwz0Izi6v9saQqGo0',
    tag: 'phases-pack',

    secondCopyOf: '5809',
    lands: [{ count: 6, id: '6160' }],
  },
  {
    id: 'c8daca69-6eb9-46d8-8481-29ee2090de75',
    oracle_id: '62b6681d-1211-4d79-8be4-121978821039',
    name: 'Urzatron',
    url: 'https://lh3.googleusercontent.com/d/1RCywujUvML1StyynlHAd6d8sRsM-lYAf',
    tag: 'urzatron-pack',
    secondCopyOf: '5797',
    lands: [{ count: 3, id: '6236' }],
  },
  {
    id: '1c45fac0-c26e-4cc9-ab48-72e80f01e10a',
    oracle_id: '5fae4433-8d4e-4b95-a044-f4aeb61c8958',
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
