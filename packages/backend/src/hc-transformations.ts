import fs from 'fs';

import { fetchTokens } from './fetchTokens.ts';
import { fetchCards } from './fetchCards.ts';
import { fetchUsernameMappings } from './fetchUsernameMapping.ts';
import {
  HCCard,
  HCCardFace,
  HCLegalitiesField,
  HCLegality,
  HCRelatedCard,
  SetCode,
  allSetsList,
  anyPropType,
  anyValueType,
} from '@hellfall/shared/types';
import {
  textPrep,
  setDerivedProps,
  getAllRelatedPermissive,
  CardMap,
  mergeFromSheet,
  cleanParts,
  updateParts,
  addToJSONToCards,
  colorOrderSetList,
  getCollectorOrderSet,
  getAcceptedOrderSet,
  InvariantMap,
  resetFaceExportProps,
  buildInvariant,
  landInvariantMap,
  tokenInvariantMap,
  textListIsContainedBy,
  cardToRelatedCard,
} from '@hellfall/shared/utils';
import namesRawData from '@hellfall/shared/data/oracle-names.json';
import { fetchHCJFronts } from './fetchHCJFronts.ts';
import { makeSort } from '@hellfall/shared/filters';
import { printHCJ } from './printHCJ.ts';

const usingApproved = false;
const typeSet = new Set<string>();
const keywordSet = new Set<string>();
const creatorSet = new Set<string>();
const artistSet = new Set<string>();
const tagSet = new Set<string>();
const NO_SCRYFALL = process.argv.includes('--noscryfall');
const PRINT_HCJ = process.argv.includes('--printhcj');

const mergeDatabases = (
  existingCards: CardMap,
  newCards: CardMap,
  existingTokens: CardMap,
  newTokens: CardMap
): HCCard.Any[] => {
  // newCards.forEach((newCard: HCCard.Any, id: string) => {});
  const mergedCards = newCards.mapToMap((newCard: HCCard.Any, id: string) => {
    const existingCard = existingCards.get(id);
    if (existingCard) {
      return mergeFromSheet(existingCard, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    existingCards
      .filter(card => !mergedCards.has(card.id))
      .forEach(card => {
        setDerivedProps(card);
        mergedCards.set(card);
      });
  }

  const mergedTokens = newTokens.mapToMap((newCard: HCCard.Any, id: string) => {
    const existingCard = existingTokens.get(id);
    if (existingCard) {
      return mergeFromSheet(existingCard, newCard);
    } else if (newCard.kind == 'token' && existingTokens.hasOracleId(newCard.oracle_id)) {
      const cardCopy = structuredClone(existingTokens.getPreferredByOracleId(newCard.oracle_id))!;
      cardCopy.id = newCard.id;
      return mergeFromSheet(cardCopy, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    existingTokens
      .filter(card => !mergedTokens.has(card.id))
      .forEach(card => {
        setDerivedProps(card);
        mergedTokens.set(card);
      });
  } else if (NO_SCRYFALL) {
    existingTokens.getAllInSet('SFT').forEach(card => {
      setDerivedProps(card);
      mergedTokens.set(card);
    });
  }
  mergedCards.forEach(entry => {
    if (!entry.collector_number) {
      throw new Error(`Card missing collector_number (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
    if (!entry.accepted_order) {
      throw new Error(`Card missing accepted_order (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
  });
  mergedTokens.forEach(entry => {
    if (!entry.collector_number) {
      throw new Error(`Token missing collector_number (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
    if (!entry.accepted_order) {
      throw new Error(`Token missing accepted_order (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
  });

  return mergedCards
    .cards()
    .sort((a, b) => {
      if (parseInt(a.hcid) == parseInt(b.hcid)) {
        if (a.hcid > b.hcid) {
          return 1;
        }
        return -1;
      } else if (parseInt(a.hcid) > parseInt(b.hcid)) {
        return 1;
      }
      return -1;
    })
    .concat(
      mergedTokens.cards().sort((a, b) => {
        if (a.set != b.set) {
          return allSetsList.indexOf(a.set) - allSetsList.indexOf(b.set);
        }
        if (a.collector_number && b.collector_number) {
          return parseInt(a.collector_number) - parseInt(b.collector_number);
        }
        if (a.name == b.name) {
          if (
            (parseInt(a.hcid.match(/\d+$/)?.[0] || '') || 0) >
            (parseInt(b.hcid.match(/\d+$/)?.[0] || '') || 0)
          ) {
            return 1;
          }
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      })
    );
};
const dataToCards = <K extends anyPropType>(
  cards: any,
  missingProp?: K,
  missingPropValue?: anyValueType<K> | ((card: HCCard.Any) => anyValueType<K>),
  addTo?: 'faces' | 'parts'
) => {
  if (!missingProp || missingPropValue == undefined) {
    return cards as HCCard.Any[];
  }
  switch (addTo) {
    case 'faces':
      return cards.map((card: any) => {
        if ('card_faces' in card) {
          card.card_faces = card.card_faces.map((face: any) => {
            if (!(missingProp in face)) {
              return {
                ...face,
                [missingProp]:
                  typeof missingPropValue == 'function'
                    ? (missingPropValue as (card: HCCard.Any) => anyValueType<K>)(
                        card as HCCard.Any
                      )
                    : missingPropValue,
              } as HCCardFace.MultiFaced;
            }
            return face as HCCardFace.MultiFaced;
          });
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
    case 'parts':
      return cards.map((card: any) => {
        if ('all_parts' in card) {
          card.all_parts = card.all_parts.map((part: any) => {
            if (!(missingProp in part)) {
              return {
                ...part,
                [missingProp]:
                  typeof missingPropValue == 'function'
                    ? (missingPropValue as (card: HCCard.Any) => anyValueType<K>)(
                        card as HCCard.Any
                      )
                    : missingPropValue,
              } as HCRelatedCard;
            }
            return part as HCRelatedCard;
          });
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
  }
  return cards.map((card: any) => {
    if (!(missingProp in card)) {
      return {
        ...card,
        [missingProp]:
          typeof missingPropValue == 'function'
            ? (missingPropValue as (card: HCCard.Any) => anyValueType<K>)(card as HCCard.Any)
            : missingPropValue,
      } as HCCard.Any;
    }
    return card as HCCard.Any;
  }) as HCCard.Any[];
};
const loadExistingData = () => {
  const databasePath = '../shared/src/data/Hellscube-Database.json';
  const tokensPath = '../shared/src/data/tokens.json';

  let databaseContent = undefined;
  let tokensContent = undefined;

  try {
    databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load cards, proceeding with undefined content:', error);
  }

  const existingCards = new CardMap(
    dataToCards(databaseContent?.data.filter((e: HCCard.Any) => e.kind == 'card') ?? [])
  );

  try {
    tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = new CardMap(dataToCards(tokensContent?.data ?? []));

  return { existingCards, existingTokens };
};
const ignoreDuplicateNumbers: Partial<Record<SetCode, string[]>> = {
  HCV_1_0: ['8b'],
  HCV_2_1: ['87b'],
  HC9_0: ['137b', '324b'],
};
const ignoreDuplicateOrders: Partial<Record<SetCode, string[]>> = {
  HLC_0: ['8b', '65b'],
  HC2_1: ['38b', '38c', '38d', '38e', '61b', '61c', '61d', '61e', '61f', '87b'],
  HC3_1: ['251b', '348b', '348c', '348d'],
  HC6_0: ['11b'],
  HC7_1: ['156b','156c'],
  HCJ: ['15b', '444b', '444c'],
  HC8_0: ['292b', '292c'],
  HC8_1: ['31b'],
  HC9_0: ['137b', '324b'],
};
const nontokenTokenNames = [
  'Force of Will',
  'Radiation',
  'Poison Counter',
  'Indicate',
  'Manifest',
  'Undead Servant',
];

const tokenNames = ['Storm Crow'];

const getLegalitiesFromLandName = (name: string): HCLegalitiesField => {
  const splitName = name.toLowerCase().split(' ');
  switch (splitName[0]) {
    case 'snow-covered':
      return {
        standard: HCLegality.NotLegal,
        '4cb': HCLegality.NotLegal,
        commander: HCLegality.NotLegal,
      };
    case 'thriving':
      return {
        standard: HCLegality.NotLegal,
        '4cb': HCLegality.NotLegal,
        commander: HCLegality.Legal,
      };
    case 'nebula':
      return {
        standard: HCLegality.NotLegal,
        '4cb': HCLegality.Legal,
        commander: HCLegality.Legal,
      };
    default:
      return {
        standard: HCLegality.Legal,
        '4cb': HCLegality.Legal,
        commander: HCLegality.Legal,
      };
  }
};

const main = async () => {
  const newCards = await fetchCards();
  const usernameMappings = await fetchUsernameMappings();
  const newTokens = await fetchTokens(NO_SCRYFALL);
  newTokens.setMultiple(fetchHCJFronts());

  console.log('Running in update mode - merging with existing data...');
  const { existingCards, existingTokens } = loadExistingData();
  const merged = mergeDatabases(existingCards, newCards, existingTokens, newTokens);
  const finalCards = new CardMap(addToJSONToCards(merged));
  const nameSort = makeSort('name', 'asc');
  const colorSort = makeSort('color', 'asc', true);
  colorOrderSetList.forEach(set =>
    finalCards
      .getAllInSetDirect(set)
      .sort(nameSort.filter)
      .sort(colorSort.filter)
      .forEach((card, i) => {
        card.collector_number = `${i + 1}`;
      })
  );

  const collectorMap = new Map<SetCode, Set<number>>(
    finalCards.sets().map(code => [getCollectorOrderSet(code), new Set<number>()])
  );
  const acceptedMap = new Map<SetCode, Set<number>>(
    finalCards.sets().map(code => [getAcceptedOrderSet(code), new Set<number>()])
  );
  finalCards.forEach(card => {
    const cn = parseInt(card.collector_number);
    const ao = parseInt(card.accepted_order);
    const cSet = collectorMap.get(getCollectorOrderSet(card.set));
    const aSet = acceptedMap.get(getAcceptedOrderSet(card.set));
    if (
      cSet?.has(cn) &&
      !ignoreDuplicateNumbers[getCollectorOrderSet(card.set)]?.includes(card.collector_number)
    ) {
      console.log(
        `Set ${getCollectorOrderSet(card.set)} has a duplicate collector number at ${cn} (hcid: ${
          card.hcid
        }, raw: ${card.collector_number})`
      );
    } else if (cn) {
      cSet?.add(cn);
    }
    if (
      aSet?.has(ao) &&
      !ignoreDuplicateOrders[getAcceptedOrderSet(card.set)]?.includes(card.accepted_order)
    ) {
      console.log(
        `Set ${getAcceptedOrderSet(card.set)} has a duplicate accepted order at ${ao} (hcid: ${
          card.hcid
        }, raw: ${card.accepted_order})`
      );
    } else if (ao) {
      aSet?.add(ao);
    }
  });

  for (const [code, nums] of collectorMap) {
    if (code.startsWith('HCV') || ['HCT', 'NRM', 'SFT'].includes(code)) continue;
    const max = Math.max(...Array.from(nums));
    for (let i = 1; i < max; i++) {
      if (!nums.has(i)) {
        console.log(`Set ${getCollectorOrderSet(code)} has a missing collector number at ${i}`);
      }
    }
  }

  for (const [code, nums] of acceptedMap) {
    if (/* code.startsWith('HCV') ||  */['HCT', 'NRM', 'SFT', 'HCV_SOH', 'HCV_8', 'HCV_9'].includes(code)) continue;
    const max = Math.max(...Array.from(nums));
    for (let i = 1; i < max; i++) {
      if (!nums.has(i)) {
        console.log(`Set ${getAcceptedOrderSet(code)} has a missing accepted order at ${i}`);
      }
    }
  }
  finalCards.forEach(card => {
    if (card.all_parts) {
      if (card.layout == 'front') {
        const relateds = finalCards.filterFromSetExactToMap('HCJ', value =>
          value.tags?.includes(card.tags![0])
        );
        updateParts(card, relateds);
        if (PRINT_HCJ) {
          printHCJ(card, relateds);
        }
      } else {
        updateParts(card, getAllRelatedPermissive(card, finalCards));
      }
    }
  });

  finalCards.forEach(card => cleanParts(card, getAllRelatedPermissive(card, finalCards)));

  const takenNames = new Set(namesRawData.data);

  const invariantMap = new InvariantMap();
  landInvariantMap.forEach(invariant => {
    const newInvariant = structuredClone(invariant);
    newInvariant.legalities = getLegalitiesFromLandName(newInvariant.name);
    if (!textListIsContainedBy(['Nebula', 'Galaxy'], newInvariant.name)) {
      newInvariant.oracle_id_is_scryfall = true;
      newInvariant.export_name = `${invariant.name}_`;
    }
    invariantMap.set(newInvariant);
  });

  tokenInvariantMap.forEach(invariant => {
    const newInvariant = structuredClone(invariant);
    if (nontokenTokenNames.includes(newInvariant.name)) {
      if (takenNames.has(newInvariant.name.toLowerCase())) {
        newInvariant.export_name = `${newInvariant.name}_`;
        takenNames.add(newInvariant.export_name.toLowerCase());
      } else {
        takenNames.add(newInvariant.name.toLowerCase());
      }
    } else {
      const splitName = newInvariant.name.split(' ');
      if (splitName.at(-1)?.length == 1 || splitName.at(-1) == 'Token') {
        newInvariant.name = splitName[0];
      }
      let exportName = `${newInvariant.name} ${
        tokenNames.includes(newInvariant.name) ? '(Token)' : 'Token'
      }`;
      while (takenNames.has(exportName.toLowerCase())) {
        exportName += '_';
      }
      newInvariant.export_name = exportName;
      takenNames.add(newInvariant.export_name.toLowerCase());
    }
    invariantMap.set(newInvariant);
  });

  finalCards.forEach(card => {
    resetFaceExportProps(card);
    if (!invariantMap.has(card.oracle_id)) {
      invariantMap.set(buildInvariant(card, takenNames));
    } else {
      invariantMap.set(card);
    }
  });
  invariantMap.applyAllInvariants(finalCards);
  finalCards.forEach(entry => {
    if (entry.all_parts) {
      if (!entry.all_parts.length) {
        delete entry.all_parts;
      } else if (entry.all_parts.every(part => part.id != entry.id)) {
        entry.all_parts.push(cardToRelatedCard(entry, 'self'));
      }
    }
  });

  finalCards.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(textPrep(typeEntry.replaceAll(/[[\]{}*_~]/g, ''), true));
        }
      );
    });

    entry.keywords.forEach(e => keywordSet.add(e.replaceAll('"', '')));
    entry.creators = entry.creators.map(creator => {
      if (creator in usernameMappings) {
        creatorSet.add(usernameMappings[creator]);
        return usernameMappings[creator];
      }
      creatorSet.add(creator);
      return creator;
    });

    entry.artists?.forEach(e => artistSet.add(e.replaceAll('"', '')));
    entry.tags?.forEach(e => tagSet.add(e.replaceAll('"', '')));
  });

  const types = Array.from(typeSet).sort((a, b) => {
    if (a > b) {
      return 1;
    }
    return -1;
  });
  const reducedTypes: string[] = [];
  const preferLower = ['a', 'an', 'and', 'in', 'of', 'the'];
  const preferUpper = ['EVIL', 'HELL', 'WET'];
  types.forEach(type => {
    const index = reducedTypes.findIndex(e => e.toLowerCase() == type.toLowerCase());
    if (index == -1) {
      reducedTypes.push(type);
    } else if (
      preferLower.includes(type) ||
      (type[0].toUpperCase() == type[0] && !preferUpper.includes(reducedTypes[index]))
    ) {
      reducedTypes.splice(index, 1);
      reducedTypes.push(type);
    }
  });
  const keywords = Array.from(keywordSet);
  const creators = Array.from(creatorSet);
  const artists = Array.from(artistSet);
  const tags = Array.from(tagSet);

  fs.writeFileSync(
    '../shared/src/data/types.json',
    JSON.stringify({ data: reducedTypes }, null, '\t')
  );
  fs.writeFileSync(
    '../shared/src/data/tokens.json',
    JSON.stringify(
      {
        data: finalCards.filter(card => card.kind != 'card'),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    '../shared/src/data/keywords.json',
    JSON.stringify(
      {
        data: keywords.sort(),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    '../shared/src/data/creators.json',
    JSON.stringify(
      {
        data: creators.sort((a, b) => {
          if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    '../shared/src/data/artists.json',
    JSON.stringify(
      {
        data: artists.sort(),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    '../shared/src/data/tags.json',
    JSON.stringify(
      {
        data: tags.sort(),
      },
      null,
      '\t'
    )
  );

  fs.writeFileSync(
    '../shared/src/data/Hellscube-Database.json',
    JSON.stringify(
      {
        data: finalCards.cards(),
      },
      null,
      '\t'
    )
  );
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
