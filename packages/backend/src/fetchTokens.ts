import { sheetsKey } from './env.ts';
import {
  HCImageStatus,
  HCRelatedCard,
  HCObject,
  HCKind,
  SetCode,
  rootPropType,
} from '@hellfall/shared/types';
import { fetchScryfallTokens } from './fetchScryfallTokens.ts';
import {
  addArtist,
  setDerivedProps,
  getDefaultCard,
  HCIDMap,
  addPropToFace,
  addPropToRoot,
  pushPropToRoot,
  parseRelatedReferenceName,
  hardTokenIds,
} from '@hellfall/shared/utils';

export const fetchTokens = async (NO_SCRYFALL: boolean) => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_oldkeys, ...rest] = asJson.values as string[][];
  const keys = [
    'name',
    'image',
    'types',
    'power',
    'toughness',
    'token_maker',
    'rulings',
    'creators',
    'tags',
    'collector_number',
    'artists',
  ] as const;

  type keyType = (typeof keys)[number];

  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const supers = ['Basic', 'Legendary', 'Snow', 'World', 'Minigame', 'Token', 'EVIL', 'WET'];
  const splitKeys: keyType[] = ['name', 'types', 'power', 'toughness'];
  const skipKeys: keyType[] = ['image', 'collector_number', 'creators', 'tags', 'artists'];

  const HCTokens = rest.map(entry => {
    const entryAt = (key: keyType) => entry[keys.indexOf(key)];
    const token = getDefaultCard(
      HCKind.Token,
      splitKeys.some(key => entry[keys.indexOf(key)].includes(' // ')),
      {
        hcid: entryAt('name'),
        set: 'HCT',
        image: entryAt('image'),
        image_status: HCImageStatus.HighRes,
        creators: entryAt('creators').split(';'),
        collector_number: entryAt('collector_number'),
      },
      {}
    );
    for (let i = 0; i < keys.length; i++) {
      if (entry[i] && !skipKeys.includes(keys[i])) {
        if (keys[i] == 'name') {
          token.name = hardTokenIds.includes(entry[i])
            ? entry[i].slice(0, -1)
            : entry[i].replace(/\d+$/, '');
        }
        if (['name', 'types', 'power', 'toughness'].includes(keys[i])) {
          const entryList = (keys[i] == 'name' ? token.name! : entry[i]).split(' // ');
          entryList.forEach((value, index) => {
            if (keys[i] == 'name') {
              addPropToFace(token, 'name', value, index);
              addPropToFace(token, 'subtypes', value.split(' '), index);
            } else if (keys[i] == 'types') {
              const typesAndSupertypes = value.split(';');
              const superList: string[] = [];
              const typeList: string[] = [];
              typesAndSupertypes.forEach(e => {
                supers.includes(e) ? superList.push(e) : typeList.push(e);
              });
              if (superList?.length) {
                addPropToFace(token, 'supertypes', superList, index);
              }
              if (typeList?.length) {
                addPropToFace(token, 'types', typeList, index);
              }
            } else if (['power', 'toughness'].includes(keys[i])) {
              addPropToFace(token, keys[i] as 'power' | 'toughness', value, index);
            }
          });
        } else if (keys[i] == 'token_maker') {
          entry[i].split(';').forEach(oldName => {
            const { name, count, base, shouldUseBase } = parseRelatedReferenceName(oldName);
            const maker: HCRelatedCard = {
              object: HCObject.ObjectType.RelatedCard,
              id: '',
              hcid: shouldUseBase ? name : '',
              name: shouldUseBase ? base : name,
              set: '' as SetCode,
              image: '',
              type_line: '',
              component: 'token_maker',
            };
            if (count) {
              maker.count = count.slice(1);
            }
            pushPropToRoot(token, 'all_parts', maker);
          });
        } else if (keys[i] == 'tags' || keys[i] == 'artists') {
          // now handling this at the end
        } else {
          addPropToRoot(token, keys[i] as rootPropType, entry[i]);
        }
      }
    }
    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      token.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(token, artist, note);
        return artist;
      });
      token.artists = Array.from(new Set(token.artists));
    }

    setDerivedProps(token, entryAt('tags').split(';'));
    token.tags?.forEach(tag => {
      if (tag == 'draftpartner' && token.all_parts) {
        token.all_parts[0].is_draft_partner = true;
        if (token.all_parts[0].component == 'token_maker') {
          // don't overwrite melds
          token.all_parts[0].component = 'draft_partner';
        }
        token.not_directly_draftable = true;
        token.has_draft_partners = true;
      } else if (tag == 'meld' && token.all_parts) {
        token.all_parts?.forEach(part => (part.component = 'meld_part'));
      }
    });
    return token;
  });
  if (NO_SCRYFALL) {
    return new HCIDMap(HCTokens);
  } else {
    const ScryfallTokens = await fetchScryfallTokens();
    return new HCIDMap(HCTokens.concat(ScryfallTokens));
  }
};
