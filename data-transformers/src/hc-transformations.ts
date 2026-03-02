import fs from 'fs';

// import { downloadImage } from "./downloadImage";
import { fetchTokens } from './fetchTokens';
import { fetchDatabase } from './fetchdatabase';
import { fetchUsernameMappings } from './fetchUsernameMapping';
import { HCCard, HCCardFace, HCRelatedCard } from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { getDefaultStore } from 'jotai';
import { loadPips, pipsAtom } from '../../src/hellfall/pipsAtom';
import { getColorIdentityProp } from '../../src/hellfall/getColorIdentity';

const typeSet = new Set<string>();
const creatorSet = new Set<string>();
const tagSet = new Set<string>();
const UPDATE_MODE = process.argv.includes('--update');
const moveCardFacesToBottom = (cards: HCCard.Any[]): HCCard.Any[] => {
  return cards.map(card => {
    if ('card_faces' in card) {
      const { card_faces, ...rest } = card;
      return { ...rest, card_faces } as HCCard.AnyMultiFaced;
    }
    return card;
  });
};
const setDerivedProps = (card: HCCard.Any) => {
  // const derivedCard:HCCard.Any = { ...card };
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach(face => {
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      mana_cost_list.push(face.mana_cost);
    });
    card.type_line = type_line_list.join(' // ');
    card.mana_cost = mana_cost_list.filter(e => e).join(' // ');
  } else {
    card.type_line = [
      card.supertypes?.join(' '),
      [card.types?.join(' '), card.subtypes?.join(' ')].filter(Boolean).join(' — '),
    ]
      .filter(Boolean)
      .join(' ') as string;
  }
  card.color_identity = getColorIdentityProp(card);
};
/**
 *
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
const mergeCards = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  const merged: HCCard.Any = { ...existingCard };

  Object.entries(newCard).forEach(([key, value]) => {
    if (value) {
      if (
        key === 'card_faces' &&
        Array.isArray(value) &&
        'card_faces' in merged &&
        'card_faces' in existingCard &&
        'card_faces' in newCard
      ) {
        merged.card_faces = existingCard.card_faces.map((face, index) => {
          if (index < value.length) {
            const newFace = newCard.card_faces?.[index];
            if (existingCard.card_faces.length > 4 && index == 3) {
              // this is necessary due to how the sheet is formatted
              // TODO: store current version and print the diff if there is one
            } else {
              Object.entries(newFace).forEach(([k, v]) => {
                if (['name', 'oracle_text'].includes(k)) {
                  if (face[k as keyof typeof face]![0] == ';') {
                    // TODO: store current version and print the diff if there is one
                  } else if (v) {
                    (face as any)[k] = v;
                  }
                } else if (['colors', 'image_status'].includes(k)) {
                  // TODO: store current version and print the diff if there is one
                } else if (v) {
                  (face as any)[k] = v;
                }
              });
            }
          }
          return face;
        });
        // TODO: Is this necessary?
        while (merged.card_faces.length < newCard.card_faces.length) {
          merged.card_faces.push(newCard.card_faces[merged.card_faces.length]);
        }
      } else if (
        key === 'all_parts' &&
        Array.isArray(value) &&
        'all_parts' in merged &&
        'all_parts' in existingCard &&
        'all_parts' in newCard
      ) {
        merged.all_parts = existingCard.all_parts!.map((part, index) => {
          if (index < value.length) {
            const newPart = newCard.all_parts?.[index]!;
            Object.entries(newPart).forEach(([k, v]) => {
              if (k == 'name' && v) {
                (part as any)[k] = v;
              }
            });
          }
          return part;
        });
        // TODO: Is this necessary?
        while (merged.all_parts.length < newCard.all_parts!.length) {
          merged.all_parts.push(newCard.all_parts![merged.all_parts.length]);
        }
      } else if (!['keywords', 'variation'].includes(key)) {
        (merged as any)[key] = value;
      }
    }
  });
  setDerivedProps(merged);
  return merged;
};
const mergeDatabases = (
  existingCards: HCCard.Any[],
  newCards: HCCard.Any[],
  existingTokens: HCCard.Any[],
  newTokens: HCCard.Any[]
): { mergedCards: HCCard.Any[]; mergedTokens: HCCard.Any[] } => {
  const newCardMap = new Map(newCards.map(card => [card.id, card]));
  const newTokenMap = new Map(newTokens.map(token => [token.id, token]));

  const mergedCards = existingCards.map(existingCard => {
    const newCard = newCardMap.get(existingCard.id);
    if (newCard) {
      newCardMap.delete(newCard.id);
      return mergeCards(existingCard, newCard);
    }
    return existingCard;
  });
  mergedCards.push(...Array.from(newCardMap.values()));

  const mergedTokens = existingTokens.map(existingToken => {
    const newToken = newTokenMap.get(existingToken.id);
    if (newToken) {
      newTokenMap.delete(newToken.id);
      return mergeCards(existingToken, newToken);
    }
    return existingToken;
  });
  mergedTokens.push(...Array.from(newTokenMap.values()));

  return { mergedCards, mergedTokens };
};
const loadExistingData = () => {
  try {
    const databasePath = './src/data/Hellscube-Database.json';
    const tokensPath = './src/data/tokens.json';

    let existingCards: HCCard.Any[] = [];
    let existingTokens: HCCard.Any[] = [];

    if (fs.existsSync(databasePath)) {
      const databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
      existingCards = databaseContent.data || [];
      existingCards = existingCards.filter(e => e.set != 'HCT');
    }

    if (fs.existsSync(tokensPath)) {
      const tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
      existingTokens = tokensContent.data || [];
    }

    return { existingCards, existingTokens };
  } catch (error) {
    console.warn('Could not load existing data, proceeding with fresh data only:', error);
    return { existingCards: [], existingTokens: [] };
  }
};
const main = async () => {
  const store = getDefaultStore();
  const pips = await loadPips();
  store.set(pipsAtom, pips);

  const { data: newCards } = { data: await fetchDatabase() };
  const usernameMappings = await fetchUsernameMappings();

  const newTokens = await fetchTokens();
  let finalCards = newCards;
  let finalTokens = newTokens;
  if (UPDATE_MODE) {
    console.log('Running in update mode - merging with existing data...');
    const { existingCards, existingTokens } = loadExistingData();
    const merged = mergeDatabases(existingCards, newCards, existingTokens, newTokens);
    finalCards = merged.mergedCards;
    finalTokens = merged.mergedTokens as HCCard.AnySingleFaced[];
  } else {
    console.log('Running in overwrite mode - using fresh data only...');
  }

  finalTokens
    .filter(e => 'all_parts' in e)
    .forEach(token => {
      const relatedToken: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: token.id,
        component: 'token',
        name: token.name,
        type_line: token.type_line,
      };
      token.all_parts?.forEach(tokenMaker => {
        const relatedCard = finalCards.find(card =>
          tokenMaker.id ? card.id == tokenMaker.id : card.name == tokenMaker.name
        );
        if (relatedCard) {
          tokenMaker.id = relatedCard.id;
          tokenMaker.name = relatedCard.name;
          tokenMaker.type_line = relatedCard.type_line;
          if ('all_parts' in relatedCard) {
            const tokenIndex = relatedCard.all_parts?.findIndex(e => e.id == token.id);
            if (tokenIndex == -1) {
              relatedCard.all_parts?.push(relatedToken);
            } else {
              relatedCard.all_parts![tokenIndex!] = relatedToken;
            }
          } else {
            relatedCard.all_parts = [relatedToken];
          }
        }
      });
    });
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      card.all_parts?.forEach(storedRelated => {
        const relatedCard = finalCards.find(e => e.id == storedRelated.id);
        if (relatedCard) {
          storedRelated.id = relatedCard.id;
          storedRelated.name = relatedCard.name;
          storedRelated.type_line = relatedCard.type_line;
        }
      });
    });

  finalCards.forEach(entry => {
    [...(entry.subtypes || []), ...(entry.types || []), ...(entry.subtypes || [])].forEach(
      typeEntry => {
        typeSet.add(typeEntry);
      }
    );

    const usernameMappingEntries = Object.entries(usernameMappings);

    replaceLoop: for (const [replacementName, oldNames] of usernameMappingEntries) {
      for (const oldName of oldNames) {
        if (entry.creator.split(';').includes(oldName)) {
          entry.creator = entry.creator.replace(oldName, replacementName);
          break replaceLoop;
        }
      }
    }

    creatorSet.add(entry.creator);

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }

    // if (entry.Constructed) {
    //   // @ts-expect-error not sure about this approach but hey.
    //   entry.Constructed = entry.Constructed.split(', ');
    // }

    // if (tokenMap[entry.Name]) {
    //   // Debug unused tokens
    //   // (tokenMap[entry.Name] as any).used = true;

    //   entry.tokens = tokenMap[entry.Name];

    //   // if (["HC8.0", "HC8.1"].includes(entry.Set)) {
    //   //   console.log(entry.Name);
    //   // }
    // }

    // if (
    //   entry["Text Box"]?.find((e) => e?.includes(" token")) &&
    //   !entry.tokens &&
    //   entry.Set === "HC6"
    // ) {
    //   console.log(
    //     entry.Name +
    //       "  " +
    //       /[^ ]+ [^ ]+ token/.exec(entry["Text Box"].join(","))![0],
    //   );
    // }
  });

  const types = Array.from(typeSet);
  const creators = Array.from(creatorSet);
  const tags = Array.from(tagSet);

  fs.writeFileSync(
    './src/data/types.json',
    JSON.stringify(
      {
        data: types.sort((a, b) => {
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
    './src/data/tokens.json',
    JSON.stringify(
      {
        data: finalTokens.sort((a, b) => {
          if (a > b) {
            return -1;
          }
          return 1;
        }),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    './src/data/tags.json',
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
    './src/data/creators.json',
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
    './src/data/Hellscube-Database.json',
    JSON.stringify(
      {
        data: moveCardFacesToBottom(finalCards.concat(finalTokens)),
      },
      null,
      '\t'
    )
  );
};

main();
