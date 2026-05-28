import fs from 'fs';

import { fetchTokens } from './fetchTokens.ts';
import { fetchCards } from './fetchCards.ts';
import { fetchUsernameMappings } from './fetchUsernameMapping.ts';
import { HCCard, HCCardFace, HCRelatedCard, HCKind } from '@hellfall/shared/types';
import { allSetsList } from '@hellfall/shared/data/sets.ts';
import { fetchNotMagic } from './fetchNotMagic.ts';
import {
  facePropType,
  propType,
  pushProp,
  stripMasterpiece,
  textEquals,
  textPrep,
  toFaces,
  addProp,
  addPropToFace,
  deleteProp,
  deletePropFromFace,
  getCardEntries,
  getFaceEntries,
  getFilteredCardEntries,
  getFilteredCardMoveEntries,
  getFilteredCardProps,
  getFilteredFaceMoveEntries,
  getFilteredFaceProps,
  setDerivedProps,
  setExportProps,
  toCardMap,
  getAllRelated,
  filterMap,
  stripSetCode,
  allPropType,
  valueType,
} from '@hellfall/shared/utils';
import namesRawData from '@hellfall/shared/data/oracle-names.json';
import { addToJSONToCards } from '@hellfall/shared/utils';
import { fetchHCJFronts } from './fetchHCJFronts.ts';
import { fetchLands } from './fetchLands.ts';
import { cleanParts, updateParts } from '@hellfall/shared/utils/fetchHandling/partsHandling.ts';

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
const kindBlankableProps: Partial<Record<HCKind, propType[]>> = {
  card: ['mana_cost', 'mana_value', 'oracle_text', 'rulings'],
  notmagic: ['mana_cost', 'mana_value', 'oracle_text'],
};
const kindRemovableProps: Partial<Record<HCKind, propType[]>> = {
  card: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'watermark',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  token: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'power',
    'toughness',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'watermark',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  land: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'watermark',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  notmagic: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'color_indicator',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'watermark',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
};
const kindFaceRemovableProps: Partial<Record<HCKind, facePropType[]>> = {
  card: ['compress_face', 'frame'],
  token: ['frame'],
};

const kindIgnoreProps: Record<HCKind, propType[]> = {
  card: ['keywords'],
  token: ['mana_cost', 'mana_value', 'subtypes', 'oracle_text', 'colors', 'rulings'],
  land: ['keywords'],
  front: ['keywords'],
  scryfall: ['keywords'],
  notmagic: ['keywords'],
};

const cardKeepProps: propType[] = [
  'id',
  'id_is_scryfall',
  'oracle_id',
  'oracle_id_is_scryfall',
  'image_status',
  'draft_image_status',
  'keywords',
];

const cardMoveProps: (propType & facePropType)[] = [
  'attraction_lights',
  'colors',
  'color_indicator',
];
const tokenKeepProps: propType[] = [
  'id',
  'id_is_scryfall',
  'oracle_id',
  'oracle_id_is_scryfall',
  'image_status',
  'mana_cost',
  'mana_value',
  'colors',
  'draft_image_status',
  'keywords',
];

const tokenMoveProps: (propType & facePropType)[] = [
  'mana_cost',
  'mana_value',
  'subtypes',
  'oracle_text',
  'flavor_text',
  'attraction_lights',
  'colors',
  'color_indicator',
];
/**
 *
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
const mergeCards = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  if ('card_faces' in existingCard != 'card_faces' in newCard) {
    if (existingCard.kind == 'scryfall') {
      throw console.error();
    } else {
      const merged: HCCard.Any = { ...newCard };
      getFilteredCardEntries(
        existingCard,
        existingCard.kind == 'token' ? tokenKeepProps : cardKeepProps
      ).forEach(([key, value]) => addProp(merged, key, value));
      if ('card_faces' in merged) {
        getFilteredCardMoveEntries(
          existingCard,
          existingCard.kind == 'token' ? tokenMoveProps : cardMoveProps
        ).forEach(([key, value]) => addPropToFace(merged, key, value));
      } else if ('card_faces' in existingCard) {
        getFilteredFaceMoveEntries(
          existingCard,
          existingCard.kind == 'token' ? tokenMoveProps : cardMoveProps
        ).forEach(([key, value]) => addProp(merged, key, value));
      }

      setDerivedProps(merged);
      return merged;
    }
  }

  const merged: HCCard.Any = { ...existingCard };
  getCardEntries(newCard).forEach(([key, value]) => {
    if (value) {
      if (
        key === 'card_faces' &&
        Array.isArray(value) &&
        'card_faces' in merged &&
        'card_faces' in existingCard &&
        'card_faces' in newCard
      ) {
        newCard.card_faces.forEach((face, index) => {
          if (index < merged.card_faces.length) {
            getFaceEntries(newCard, index).forEach(([k, v]) => {
              if (k == 'colors' && existingCard.kind != 'scryfall') {
                // TODO: store current version and print the diff if there is one
              } else if (k == 'image_status' && face.image) {
                // TODO: store current version and print the diff if there is one
              } else if (kindIgnoreProps[merged.kind].includes(k)) {
              } else if (v || kindBlankableProps[merged.kind]?.includes(k)) {
                addPropToFace(merged, k, v, index);
              }
            });
            getFilteredFaceProps(
              existingCard,
              (kindRemovableProps[merged.kind] ?? []) as facePropType[],
              index
            )
              .filter(prop => !face[prop])
              .forEach(prop => {
                if (prop == 'image') {
                  addPropToFace(merged, 'image_status', face.image_status);
                }
                deletePropFromFace(merged, prop, index);
              });
            getFilteredFaceProps(existingCard, kindFaceRemovableProps[merged.kind] ?? [], index)
              .filter(prop => !face[prop])
              .forEach(prop => {
                if (prop == 'image') {
                  addPropToFace(merged, 'image_status', face.image_status);
                }
                deletePropFromFace(merged, prop, index);
              });
          }
        });
        while (merged.card_faces.length < newCard.card_faces.length) {
          merged.card_faces.push(newCard.card_faces[merged.card_faces.length]);
        }
      } else if (key == 'image_status') {
        // TODO: store current version and print the diff if there is one
        // if (!('image_status' in merged) || merged.image_status == HCImageStatus.Missing) {
        // merged.image_status = value as HCImageStatus;
        // }
      } else if (key == 'draft_image_status') {
        // TODO: store current version and print the diff if there is one
      } else if (key in merged && key == 'name' && merged.tags?.includes('irregular-name')) {
        merged.flavor_name = value;
        // TODO: store current version and print the diff if there is one
      } else if (kindIgnoreProps[merged.kind].includes(key)) {
      } else if (key == 'all_parts' && existingCard.all_parts && newCard.all_parts) {
        merged.all_parts = newCard.all_parts?.map(part => {
          // is true when the thing that makes this is itself a token
          const tokenIsMaker = part.name && part.hcid;
          const existingPart = tokenIsMaker
            ? existingCard.all_parts?.find(e => textEquals(e.hcid, part.hcid))
            : existingCard.all_parts?.find(
                e => textEquals(e.name, part.name) && e.name != e.hcid.replace(/\d+$/, '')
              );
          if (existingPart) {
            // if there is already a part, update it
            Object.entries(existingPart).forEach(([k, v]) => {
              if (!['name', 'component' /**,'is_draft_partner'*/].includes(k) && v) {
                (part as any)[k] = v;
              }
            });
          }
          return part;
        });
      } else if (key == 'layout') {
        // TODO: store current version and print the diff if there is one
        if (
          !('card_faces' in merged) &&
          !('card_faces' in newCard) /**&&
          (merged.layout == HCLayout.Normal || merged.layout == HCLayout.Token)*/
        ) {
          merged.layout = value as typeof newCard.layout;
        } else if ('card_faces' in merged && 'card_faces' in newCard) {
          merged.layout = value as typeof newCard.layout;
        }
      } else {
        addProp(merged, key, value);
      }
    } else if (kindBlankableProps[merged.kind]?.includes(key) && merged[key as allPropType]) {
      addProp(merged, key, value);
    }
  });
  getFilteredCardProps(existingCard, kindRemovableProps[existingCard.kind] ?? [])
    .filter(prop => !(prop in newCard))
    .forEach(prop => {
      if (prop == 'image') {
        addProp(merged, 'image_status', newCard.image_status);
      } else if (prop == 'draft_image') {
        deleteProp(merged, 'draft_image_status');
      }
      deleteProp(merged, prop);
    });
  setDerivedProps(merged);
  return merged;
};
const mergeDatabases = (
  existingCards: HCCard.Any[],
  newCards: HCCard.Any[],
  existingTokens: HCCard.Any[],
  newTokens: HCCard.Any[],
  existingLands: HCCard.Any[],
  newLands: HCCard.Any[]
): { mergedCards: HCCard.Any[]; mergedTokens: HCCard.Any[]; mergedLands: HCCard.Any[] } => {
  const existingCardMap = new Map(existingCards.map(card => [card.hcid, card]));
  const existingTokenMap = new Map(existingTokens.map(token => [token.hcid.toLowerCase(), token]));
  const existingLandMap = new Map(existingLands.map(land => [land.hcid, land]));

  const mergedCards = newCards.map(newCard => {
    const existingCard = !(newCard.hcid in movedIds)
      ? existingCardMap.get(newCard.hcid)
      : existingCardMap.get(movedIds[newCard.hcid]);
    if (existingCard) {
      existingCardMap.delete(existingCard.hcid);
      return mergeCards(existingCard, newCard);
    }
    // setDerivedProps(newCard);
    return newCard;
  });
  if (usingApproved) {
    mergedCards.push(
      ...Array.from(
        existingCardMap.values().map(card => {
          setDerivedProps(card);
          return card;
        })
      )
    );
  }

  const mergedTokens = newTokens.map(newToken => {
    const existingToken = !(newToken.hcid in movedIds)
      ? existingTokenMap.get(newToken.hcid?.toLowerCase())
      : existingTokenMap.get(movedIds[newToken.hcid]);
    if (existingToken) {
      existingTokenMap.delete(existingToken.hcid.toLowerCase());
      return mergeCards(existingToken, newToken);
    }
    // setDerivedProps(newToken);
    return newToken;
  });
  if (usingApproved) {
    mergedTokens.push(
      ...Array.from(
        existingTokenMap.values().map(token => {
          setDerivedProps(token);
          return token;
        })
      )
    );
  } else if (NO_SCRYFALL) {
    mergedTokens.push(
      ...Array.from(
        existingTokenMap
          .values()
          .filter(token => token.set == 'SFT')
          .map(token => {
            setDerivedProps(token);
            return token;
          })
      )
    );
  }
  const mergedLands = newLands.map(newLand => {
    const existingLand = !(newLand.hcid in movedIds)
      ? existingLandMap.get(newLand.hcid)
      : existingLandMap.get(movedIds[newLand.hcid]);
    if (existingLand) {
      existingLandMap.delete(existingLand.hcid);
      return mergeCards(existingLand, newLand);
    }
    // setDerivedProps(newLand);
    return newLand;
  });
  if (usingApproved) {
    mergedLands.push(
      ...Array.from(
        existingLandMap.values().map(land => {
          setDerivedProps(land);
          return land;
        })
      )
    );
  }
  const collectorNumberAutofillSets: Record<string, number> = {
    'HCV.2': 0,
    'HCV.3': 0,
    'HCV.4': 0,
    'HCV.6': 0,
    'HCV.7': 0,
    'HCV.8': 0,
    'HCV.9': 0,
    'HC9.0': 0,
    HC9: 0,
    'HCV.J': 0,
    'HCV.K': 0,
    'HCV.L': 0,
    'HCV.P': 0,
    'HCV.CDC': 0,
    NRM: 0,
    HCJ: 0,
    NMTG: 0,
    SFT: 0,
  };
  mergedCards.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw console.error;
      }
    }
  });
  mergedTokens.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw console.error;
      }
    }
  });
  mergedLands.forEach(entry => {
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw console.error;
      }
    }
  });
  mergedCards.sort((a, b) => {
    if (parseInt(a.hcid) == parseInt(b.hcid)) {
      if (a.hcid > b.hcid) {
        return 1;
      }
      return -1;
    } else if (parseInt(a.hcid) > parseInt(b.hcid)) {
      return 1;
    }
    return -1;
  });
  mergedTokens.sort((a, b) => {
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

  return { mergedCards, mergedTokens, mergedLands };
};
const dataToCards = <K extends propType>(
  cards: any,
  missingProp?: K,
  missingPropValue?: valueType<K> | ((card: HCCard.Any) => valueType<K>),
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
                    ? missingPropValue(card as HCCard.Any)
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
                    ? missingPropValue(card as HCCard.Any)
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
            ? missingPropValue(card as HCCard.Any)
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

  const existingCards = databaseContent
    ? dataToCards(databaseContent.data.filter((e: HCCard.Any) => e.kind != 'card') || [])
    : [];

  try {
    tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = tokensContent ? dataToCards(tokensContent.data || []) : [];

  try {
    landsContent = JSON.parse(fs.readFileSync(landsPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load lands, proceeding with undefined content:', error);
  }

  const existingLands = landsContent ? dataToCards(landsContent.data || []) : [];
  return { existingCards, existingTokens, existingLands };
};
const main = async () => {
  const newCards = await fetchCards();
  const usernameMappings = await fetchUsernameMappings();
  const intTokens = await fetchTokens(NO_SCRYFALL);
  const intFronts = fetchHCJFronts();
  const intNotMagic = await fetchNotMagic();
  const newTokens = intTokens.concat(intFronts).concat(intNotMagic);
  const newLands = await fetchLands();

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
  const finalCards = toCardMap(
    addToJSONToCards(merged.mergedCards.concat(merged.mergedTokens.concat(merged.mergedLands)))
  );
  // const finalTokens = toCardMap(addToJSONToCards(merged.mergedTokens));
  // const finalLands = toCardMap(addToJSONToCards(merged.mergedLands));
  finalCards.forEach(card => {
    if (card.all_parts) {
      if (card.layout == 'front') {
        updateParts(
          card,
          filterMap(finalCards, value => value.set == 'HCJ' && value.tags?.includes(card.tags![0]))
        );
      } else {
        updateParts(card, getAllRelated(card, finalCards));
      }
    }
  });
  finalCards.forEach(card => cleanParts(card, getAllRelated(card, finalCards)));

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
      entry.tags?.forEach(e => tagSet.add(e));
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
        data: Array.from(
          finalCards
            .values()
            .filter(card => ['token', 'scryfall', 'notmagic', 'front'].includes(card.kind))
        ),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    '../shared/src/data/lands.json',
    JSON.stringify(
      { data: Array.from(finalCards.values().filter(card => card.kind == 'land')) },
      null,
      '\t'
    )
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
        data: Array.from(finalCards.values()),
      },
      null,
      '\t'
    )
  );
};

main();
