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
import { fetchNotMagic } from './fetchNotMagic.ts';
import {
  stripMasterpiece,
  textEquals,
  textPrep,
  setDerivedProps,
  setExportProps,
  stripSetCode,
  getAllRelatedPermissive,
  CardMap,
  HCIDMap,
  savedOracleIds,
  getDirectChildSets,
  getParentSet,
  mergeFromSheet,
  cleanParts,
  updateParts,
  addToJSONToCards,
} from '@hellfall/shared/utils';
import namesRawData from '@hellfall/shared/data/oracle-names.json';
import { fetchHCJFronts } from './fetchHCJFronts.ts';
import { fetchLands } from './fetchLands.ts';

const usingApproved = false;
const typeSet = new Set<string>();
const creatorSet = new Set<string>();
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
  existingCards: HCIDMap,
  newCards: HCIDMap,
  existingTokens: HCIDMap,
  newTokens: HCIDMap,
  existingLands: HCIDMap,
  newLands: HCIDMap
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
  const mergedLands = newLands.map((newCard: HCCard.Any, id: string) => {
    const existingCard = existingLands.get(movedIds[id] ?? id);
    if (existingCard) {
      existingLands.delete(existingCard.hcid);
      return mergeFromSheet(existingCard, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    existingLands.forEach(card => {
      setDerivedProps(card);
      mergedLands.set(card);
    });
  }
  const collectorNumberAutofillSets: Record<string, number> = {
    'HCV.2': 0,
    'HCV.3': 0,
    'HCV.4': 0,
    'HCV.6': 0,
    'HCV.7': 0,
    'HCV.8': 0,
    'HCV.9': 0,
    'HCV.J': 0,
    'HCV.K': 0,
    'HCV.L': 0,
    'HCV.P': 0,
    'HCV.CDC': 0,
    'HCV.S': 0,
    'HCV.H': 0,
    NRM: 0,
    HCJ: 0,
    NMTG: 0,
    SFT: 0,
    HCT: 0,
  };
  mergedCards.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw new Error(
          `Card missing collector_number and set "${entry.set}" is not in collectorNumberAutofillSets (hcid: ${entry.hcid}, name: ${entry.name})`
        );
      }
    }
  });
  mergedTokens.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw new Error(
          `Token missing collector_number and set "${entry.set}" is not in collectorNumberAutofillSets (hcid: ${entry.hcid}, name: ${entry.name})`
        );
      }
    }
  });
  mergedLands.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw new Error(
          `Land missing collector_number and set "${entry.set}" is not in collectorNumberAutofillSets (hcid: ${entry.hcid}, name: ${entry.name})`
        );
      }
    }
  });
  [mergedCards, mergedTokens, mergedLands].forEach(mergedList =>
    mergedList.forEach(card => {
      if (!card.id) {
        card.id = crypto.randomUUID();
      }
      if (!card.oracle_id) {
        if (card.tags?.includes('masterpiece')) {
          const originalName = stripMasterpiece(card.name);
          const original = mergedList.find(c => textEquals(c.name, originalName));
          if (original?.oracle_id) {
            card.oracle_id = original.oracle_id;
            return;
          }
          if (originalName.toLowerCase() in savedOracleIds) {
            card.oracle_id = savedOracleIds[originalName.toLowerCase()];
            return;
          }
        } else if (card.tags?.includes('reprint')) {
          const originalName = stripSetCode(card.name);
          const original = mergedList.find(c => textEquals(c.name, originalName));
          if (original?.oracle_id) {
            card.oracle_id = original.oracle_id;
            return;
          }
        }
        card.oracle_id = crypto.randomUUID();
      }
    })
  );

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
      }),
      mergedLands.cards().sort((a, b) => parseInt(a.hcid.slice(1)) - parseInt(b.hcid.slice(1)))
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
  const landsPath = '../shared/src/data/lands.json';

  let databaseContent = undefined;
  let tokensContent = undefined;
  let landsContent = undefined;

  try {
    databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load cards, proceeding with undefined content:', error);
  }

  const existingCards = new HCIDMap(
    dataToCards(databaseContent?.data.filter((e: HCCard.Any) => e.kind == 'card') ?? [])
  );

  try {
    tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = new HCIDMap(dataToCards(tokensContent?.data ?? []));

  try {
    landsContent = JSON.parse(fs.readFileSync(landsPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load lands, proceeding with undefined content:', error);
  }

  const existingLands = new HCIDMap(dataToCards(landsContent?.data ?? []));
  return { existingCards, existingTokens, existingLands };
};
const ignoreDuplicateHCIDs: string[] = [
  '39',
  '6730',
  '6731',
  '6732',
  '6733',
  '2101',
  '2102',
  '2103',
  '6791',
  '6792',
  '6793',
  '6794',
  '6795',
  '6796',
  '6797',
  '6735',
  '7240',
  '7241',
  '7772',
  '7801',
];
const ignoreMissingNums: Partial<Record<SetCode, number[]>> = {
  'HC2.0': [93, 141, 154, 160, 187, 214, 228],
  'HC2.1': [58, 93, 103, 104, 138, 190, 201, 206, 307],
  'HC3.0': [68, 72, 96, 204, 230, 271, 305, 337],
  'HC3.1': [40, 45, 56, 62, 97, 175, 372],
  'HC4.0': [76, 93, 129, 263, 311, 364],
  'HC4.1': [146, 204, 261],
  'HC8.0': [259],
};
const main = async () => {
  const newCards = await fetchCards();
  const usernameMappings = await fetchUsernameMappings();
  const newTokens = await fetchTokens(NO_SCRYFALL);
  newTokens.setMultiple(fetchHCJFronts());
  newTokens.setMultiple(await fetchNotMagic());
  const newLands = await fetchLands();
  const collectorMap = new Map<SetCode, Set<number>>(
    newCards.sets().map(code => [code, new Set<number>()])
  );
  collectorMap.set('SCL', new Set<number>());
  getDirectChildSets('SCL')?.forEach(code => collectorMap.delete(code));
  newCards.forEach(card => {
    const num = parseInt(card.collector_number);
    const cSet =
      collectorMap.get(card.set) ?? collectorMap.get(getParentSet(card.set) ?? ('' as SetCode));
    if (ignoreDuplicateHCIDs.includes(card.hcid)) {
      return;
    }
    if (cSet?.has(num) || ignoreMissingNums[card.set]?.includes(num)) {
      console.log(
        `Set ${card.set} has a duplicate collector number at ${num} (hcid: ${card.hcid})`
      );
    } else if (num) {
      cSet?.add(num);
    }
  });
  for (const [code, nums] of collectorMap) {
    if (code == 'HCV.1' || code.startsWith('HLC')) continue;
    const max = Math.max(...Array.from(nums));
    for (let i = 1; i < max; i++) {
      if (!nums.has(i) && !ignoreMissingNums[code]?.includes(i)) {
        console.log(`Set ${code} has a missing collector number at ${i}`);
      }
    }
  }

  console.log('Running in update mode - merging with existing data...');
  const { existingCards, existingTokens, existingLands } = loadExistingData();
  const merged = mergeDatabases(
    existingCards,
    newCards,
    existingTokens,
    newTokens,
    existingLands,
    newLands
  );
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

  const takenNames = namesRawData.data;
  finalCards.forEach(entry => setExportProps(entry, takenNames));

  finalCards.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(textPrep(typeEntry.replaceAll(/[[\]{}*_~]/g, ''), true));
        }
      );
    });

    entry.creators = entry.creators.map(creator => {
      if (creator in usernameMappings) {
        creatorSet.add(usernameMappings[creator]);
        return usernameMappings[creator];
      }
      creatorSet.add(creator);
      return creator;
    });

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e.replaceAll('"', '')));
    }
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
  const creators = Array.from(creatorSet);
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
  fs.writeFileSync(
    '../shared/src/data/lands.json',
    JSON.stringify({ data: finalCards.filter(card => card.kind == 'land').cards() }, null, '\t')
  );
  fs.writeFileSync(
    '../shared/src/data/tags.json',
    JSON.stringify(
      {
        data: tags.sort((a, b) => {
          if (a > b) {
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
