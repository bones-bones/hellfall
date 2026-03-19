// import { sheetsKey } from '../../keys';
// import { HCCard, HCImageStatus, HCLayout, HCRelatedCard } from '../../src/api-types/Card';
// import { HCColor, HCColors } from '../../src/api-types/Card';
// import { HCObject } from '../../src/api-types/Object';
// import { HCLegality, HCLegalitiesField } from '../../src/api-types/Card';
// import { ScryfallCard } from "@scryfall/api-types";
// import pLimit from 'p-limit';

// const REQUEST_DELAY_MS = 75;
// const limiter = pLimit(1);

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// async function fetchCardById(cardId: string): Promise<ScryfallCard.Any> {
//   // Use the limiter to queue requests
//   return limiter(async () => {
//     const url = `https://api.scryfall.com/cards/${cardId}`;
    
//     const response = await fetch(url, {
//       headers: {
//         "User-Agent": "MyMagicApp/1.0", // Scryfall requires this [citation:6]
//         "Accept": "application/json;q=0.9,*/*;q=0.8", // Good practice [citation:6]
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 429) {
//         console.warn('Rate limited! Consider increasing your delay.');
//         // You could optionally read the Retry-After header here
//       }
//       const errorData = await response.json();
//       throw new Error(`Scryfall API error: ${response.status}`);
//     }

//     await delay(REQUEST_DELAY_MS);
    
//     const cardData: ScryfallCard.Any = (await response.json()) as any;
//     return cardData;
//   });
// }

// export const fetchScryfallTokens = async () => {
//   const requestedData = await fetch(
//     `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
//   );
//   const asJson = (await requestedData.json()) as any;

//   const [_oldkeys, ...rest] = asJson.values as string[][];
//   const keys = [
//     'name',
//     'image',
//     'type',
//     'power',
//     'toughness',
//     'token_maker',
//     'oracle_text',
//     'creator',
//   ];
//   rest.forEach(row => {
//     while (row.length < keys.length) {
//       row.push('');
//     }
//   });
  

//   const theThing = rest.map(entry => {
//     for (let i = 0; i < keys.length; i++) {
//       if (entry[i]) {
//         if (keys[i] == 'id') {

//         } else if (keys[i] == 'token_maker') {
//           tokenObject.all_parts = entry[i].split(';').map(name => {
//             const maker: HCRelatedCard = {
//               object: HCObject.ObjectType.RelatedCard,
//               id: '',
//               component: 'token_maker',
//               name: name.replace(/\*\d+$/, ''),
//               type_line: '',
//               set: '',
//               image: '',
//             };
//             return maker;
//           });
//         } else {
//           tokenObject[keys[i]] = entry[i];
//         }
//       }
//     }
//     if (entry[6] == 'meld') {
//       tokenObject.layout = HCLayout.MeldResult;
//     } else if ('types' in tokenObject && tokenObject.types[0] in typeLayouts) {
//       tokenObject.layout = typeLayouts[tokenObject.types[0]];
//       if (tokenObject.types.length > 1) {
//         tokenObject.types.shift();
//       }
//     }
//     // } else if ('types' in tokenObject && tokenObject.types.includes('Emblem')) {
//     //   tokenObject.layout = HCLayout.Emblem;
//     // } else if ('types' in tokenObject && tokenObject.types.includes('Reminder Card')) {
//     //   tokenObject.layout = HCLayout.Reminder;
//     // } else if ('types' in tokenObject && tokenObject.types.includes('Stickers')) {
//     //   tokenObject.layout = HCLayout.Stickers;
//     // } else {
//     //   tokenObject.layout = HCLayout.Token;
//     // }
//     if ('types' in tokenObject || 'supertypes' in tokenObject) {
//       tokenObject.type_line = [
//         tokenObject.supertypes?.join(' '),
//         [tokenObject.types?.join(' '), tokenObject.subtypes?.join(' ')].filter(Boolean).join(' — '),
//       ]
//         .filter(Boolean)
//         .join(' ') as string;
//     } else {
//       if ('subtypes' in tokenObject) {
//         delete tokenObject.subtypes;
//       }
//       tokenObject.type_line = '';
//     }
//     Object.keys(defaultProps)
//       .filter(key => !(key in tokenObject))
//       .forEach(key => {
//         tokenObject[key] = defaultProps[key];
//       });
//     return tokenObject as HCCard.Any;
//   });
//   return theThing;
// };
