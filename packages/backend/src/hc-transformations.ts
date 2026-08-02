import fs from 'fs';

import { fetchTokens } from './fetchTokens.ts';
import { fetchCards } from './fetchCards.ts';
import { fetchUsernameMappings } from './fetchUsernameMapping.ts';
import {
  HCCard,
  HCCardFace,
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
  getDirectChildSets,
  getParentSetCode,
  colorOrderSetList,
  getCollectorOrderSet,
  getAcceptedOrderSet,
} from '@hellfall/shared/utils';
import namesRawData from '@hellfall/shared/data/oracle-names.json';
import { fetchHCJFronts } from './fetchHCJFronts.ts';
import { makeSort } from '@hellfall/shared/filters';

const usingApproved = false;
const typeSet = new Set<string>();
const keywordSet = new Set<string>();
const creatorSet = new Set<string>();
const artistSet = new Set<string>();
const tagSet = new Set<string>();
const NO_SCRYFALL = process.argv.includes('--noscryfall');
const movedIds: Record<string, string> = {
  '219': '6727',
  '219b': '6728',
  '1121': '6729',
  '1121b': '6730',
  '1121c': '6731',
  '1121d': '6732',
  '1121e': '6733',
  '2035': '6734',
  '2035b': '6735',
};

const mergeDatabases = (
  existingCards: CardMap,
  newCards: CardMap,
  existingTokens: CardMap,
  newTokens: CardMap
): HCCard.Any[] => {
  // newCards.forEach((newCard: HCCard.Any, id: string) => {});
  const mergedCards = newCards.map((newCard: HCCard.Any, id: string) => {
    const existingCard = existingCards.get(movedIds[id] ?? id);
    if (existingCard) {
      existingCards.delete(existingCard.hcid);
      return mergeFromSheet(existingCard, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    existingCards.forEach(card => {
      setDerivedProps(card);
      mergedCards.set(card);
    });
  }

  const mergedTokens = newTokens.map((newCard: HCCard.Any, id: string) => {
    const existingCard = existingTokens.get(movedIds[id] ?? id);
    if (existingCard) {
      existingTokens.delete(existingCard.hcid);
      return mergeFromSheet(existingCard, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    existingTokens.forEach(card => {
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
      throw new Error(`Card missing accepted_order (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
  });
  mergedTokens.forEach(entry => {
    if (!entry.collector_number) {
      throw new Error(`Token missing accepted_order (hcid: ${entry.hcid}, name: ${entry.name})`);
    }
  });

  // [mergedCards, mergedTokens].forEach(mergedList =>
  //   mergedList.forEach(card => {
  //     if (!card.id) {
  //       card.id = crypto.randomUUID();
  //     }
  //     if (!card.oracle_id) {
  //       if (card.tags?.includes('masterpiece')) {
  //         const originalName = stripMasterpiece(card.name);
  //         const original = mergedList.find(c => textEquals(c.name, originalName));
  //         if (original?.oracle_id) {
  //           card.oracle_id = original.oracle_id;
  //           return;
  //         }
  //         if (baseInvariantMap.hasName(originalName)) {
  //           card.oracle_id = baseInvariantMap.getOracleID(originalName)!;
  //           return;
  //         }
  //       } else if (card.tags?.includes('reprint')) {
  //         const originalName = stripSetCode(card.name);
  //         const original = mergedList.find(c => textEquals(c.name, originalName));
  //         if (original?.oracle_id) {
  //           card.oracle_id = original.oracle_id;
  //           return;
  //         }
  //       }
  //       card.oracle_id = crypto.randomUUID();
  //     }
  //   })
  // );

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
  // const landsPath = '../shared/src/data/lands.json';

  let databaseContent = undefined;
  let tokensContent = undefined;
  // let landsContent = undefined;

  try {
    databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load cards, proceeding with undefined content:', error);
  }

  const existingCards = new CardMap(dataToCards(databaseContent?.data.filter((e: HCCard.Any) => e.kind == 'card') ?? []));

  try {
    tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = new CardMap(dataToCards(tokensContent?.data ?? []));

  // try {
  //   landsContent = JSON.parse(fs.readFileSync(landsPath, 'utf-8'));
  // } catch (error) {
  //   console.warn('Could not load lands, proceeding with undefined content:', error);
  // }

  // // #jank
  // const existingLands = new CardMap(dataToCards(landsContent?.data ?? [], 'accepted_order', ''));
  // existingCards.setMultiple(existingLands);

  return { existingCards, existingTokens };
};
const ignoreDuplicateNumbers: Partial<Record<SetCode, string[]>> = {
  'HCV.1.0': ['8b'],
  'HCV.2.1': ['138b'],
  'HC9.0': ['137b','324b'],
};
const ignoreDuplicateOrders: Partial<Record<SetCode, string[]>> = {
  'HLC.0': ['8b', '65b'],
  'HC2.1': ['114b','114c','114d','114e', '138b', '114f','217b','217c','217d','217e'],
  'HC3.1': ['248b','346b','346c','346d'],
  'HC6.0': ['10b'],
  'HC8.0': ['292b','292c'],
  'HC8.1': ['31b'],
  'HC9.0': ['137b','324b'],
};
const main = async () => {
  const newCards = await fetchCards();
  const usernameMappings = await fetchUsernameMappings();
  const newTokens = await fetchTokens(NO_SCRYFALL);
  newTokens.setMultiple(fetchHCJFronts());
  // newTokens.setMultiple(await fetchNotMagic());
  const nameSort = makeSort('name', 'asc');
  const colorSort = makeSort('color', 'asc');
  colorOrderSetList.forEach(set =>
    newCards
      .getAllInSetDirect(set)
      .cards()
      .sort(nameSort.filter)
      .sort(colorSort.filter)
      .forEach((card, i) => {
        card.collector_number = `${i + 1}`;
      })
  );

  const collectorMap = new Map<SetCode, Set<number>>(
    newCards.sets().map(code => [getCollectorOrderSet(code), new Set<number>()])
  );
  const acceptedMap = new Map<SetCode, Set<number>>(
    newCards.sets().map(code => [getAcceptedOrderSet(code), new Set<number>()])
  );
  newCards.forEach(card => {
    const cn = parseInt(card.collector_number);
    const ao = parseInt(card.accepted_order);
    const cSet = collectorMap.get(getCollectorOrderSet(card.set));
    const aSet = acceptedMap.get(getAcceptedOrderSet(card.set));
    if (cSet?.has(cn) && !ignoreDuplicateNumbers[getCollectorOrderSet(card.set)]?.includes(card.collector_number)) {
      console.log(
        `Set ${getCollectorOrderSet(card.set)} has a duplicate collector number at ${cn} (hcid: ${card.hcid}, raw: ${card.collector_number})`
      );
    } else if (cn) {
      cSet?.add(cn);
    }
    if (aSet?.has(ao) && !ignoreDuplicateOrders[getAcceptedOrderSet(card.set)]?.includes(card.accepted_order)) {
      console.log(
        `Set ${getAcceptedOrderSet(card.set)} has a duplicate accepted order at ${ao} (hcid: ${card.hcid}, raw: ${card.accepted_order})`
      );
    } else if (ao) {
      aSet?.add(ao);
    }
  });

  for (const [code, nums] of collectorMap) {
    if (/^HCV\.[1-4]\.[01]$/.test(code)) continue;
    const max = Math.max(...Array.from(nums));
    for (let i = 1; i < max; i++) {
      if (!nums.has(i)) {
        console.log(`Set ${getCollectorOrderSet(code)} has a missing collector number at ${i}`);
      }
    }
  }

  for (const [code, nums] of acceptedMap) {
    if (code.startsWith('HCV.1') || code.startsWith('HLC')) continue;
    const max = Math.max(...Array.from(nums));
    for (let i = 1; i < max; i++) {
      if (!nums.has(i)) {
        console.log(`Set ${getAcceptedOrderSet(code)} has a missing accepted number at ${i}`);
      }
    }
  }

  console.log('Running in update mode - merging with existing data...');
  const { existingCards, existingTokens } = loadExistingData();
  const merged = mergeDatabases(existingCards, newCards, existingTokens, newTokens);
  const finalCards = new CardMap(addToJSONToCards(merged));
  finalCards.forEach(card => {
    if (card.all_parts) {
      if (card.layout == 'front') {
        updateParts(
          card,
          finalCards.filterFromSetExact('HCJ', value => value.tags?.includes(card.tags![0]))
        );
      } else {
        updateParts(card, getAllRelatedPermissive(card, finalCards));
      }
    }
  });
  finalCards.forEach(card => cleanParts(card, getAllRelatedPermissive(card, finalCards)));

  // const takenNames = namesRawData.data;
  // finalCards.forEach(entry => setExportProps(entry, takenNames));

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
        data: finalCards
          .filter(card => ['token', 'scryfall', 'notmagic', 'front'].includes(card.kind))
          .cards(),
      },
      null,
      '\t'
    )
  );
  // fs.writeFileSync(
  //   '../shared/src/data/lands.json',
  //   JSON.stringify({ data: finalCards.filter(card => card.kind == 'land').cards() }, null, '\t')
  // );
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
