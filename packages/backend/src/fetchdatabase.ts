import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCColor,
  HCColors,
  HCImageStatus,
  HCLayout,
  HCLegalitiesField,
  HCFormat,
  HCLegality,
  HCRelatedCard,
  HCObject,
  HCLayoutGroup,
  HCBorderColor,
  HCFrame,
  HCFinish,
  HCFrameEffect,
} from '@hellfall/shared/types';
import { getColorIdentityProps, setDerivedProps } from './derivedProps.ts';
import { stripMasterpiece } from '@hellfall/shared/utils/textHandling.ts';
import { error } from 'console';

export const fetchDatabase = async (usingApproved: boolean = false) => {
  const url = usingApproved
    ? `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database?alt=json&key=${sheetsKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;
  const [_garbage, _oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'id',
    'name',
    'image',
    'creators',
    'set',
    'legalities',
    'related',
    'rulings',
    'mana_value',
    '0colors',
    '0mana_cost',
    '0supertypes',
    '0types',
    '0subtypes',
    '0power',
    '0toughness',
    '0loyalty',
    '0oracle_text',
    '0flavor_text',
    'artists',
    '0image',
    'tags',
    '1mana_cost',
    '1supertypes',
    '1types',
    '1subtypes',
    '1power',
    '1toughness',
    '1loyalty',
    '1oracle_text',
    '1flavor_text',
    '1image',
    '2mana_cost',
    '2supertypes',
    '2types',
    '2subtypes',
    '2power',
    '2toughness',
    '2loyalty',
    '2oracle_text',
    '2flavor_text',
    '2image',
    '3mana_cost',
    '3supertypes',
    '3types',
    '3subtypes',
    '3power',
    '3toughness',
    '3loyalty',
    '3oracle_text',
    '3flavor_text',
    '3image',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const defaultProps: Record<string, any> = {
    object: HCObject.ObjectType.Card,
    name: '',
    rulings: '',
    creators: [],
    legalities: {
      standard: HCLegality.Banned,
      '4cb': HCLegality.Banned,
      commander: HCLegality.Banned,
    } as HCLegalitiesField,
    mana_value: 0,
    colors: [] as HCColors,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: '',
    variation: false,
    border_color: HCBorderColor.Black,
    frame: HCFrame.Stamp,
    finish: HCFinish.Nonfoil,
  };

  const defaultFaceProps: Record<string, any> = {
    object: HCObject.ObjectType.CardFace,
    mana_cost: '',
    mana_value: 0,
    colors: [] as HCColors,
    oracle_text: '',
  };

  const hardCardNames: string[] = [
    'Crypt of u/Em9500',
    '1d6',
    'Avatar of BallsJr123',
    'Sekiro for the PS4',
    'Avatar of Discord v2',
    'That One Time in WW1',
    'Plagiarism by doomclaw9',
    'Carrion Feeder from MH8',
  ];

  const multiLayoutTags: Record<string, HCLayoutGroup.MultiFacedType> = {
    meld: HCLayout.MeldPart,
    'draftpartner-faces': HCLayout.DraftPartner,
    'reminder-on-back': HCLayout.ReminderOnBack,
    'dungeon-in-inset': HCLayout.DungeonInInset,
    'dungeon-on-back': HCLayout.DungeonOnBack,
    'stickers-on-back': HCLayout.StickersOnBack,
    'token-in-inset': HCLayout.TokenInInset,
    'token-on-back': HCLayout.TokenOnBack,
    specialize: HCLayout.Specialize,
    mdfc: HCLayout.Modal,
    transform: HCLayout.Transform,
    flip: HCLayout.Flip,
    inset: HCLayout.Inset,
    prepare: HCLayout.Prepare,
    aftermath: HCLayout.Aftermath,
    split: HCLayout.Split,
  };

  const singleLayoutTags: Record<string, HCLayoutGroup.SingleFacedType> = {
    'weird-leveler': HCLayout.Leveler,
    leveler: HCLayout.Leveler,
    'weird-1-mana-levelers-cycle': HCLayout.Leveler,
    'mutate-layout': HCLayout.Mutate,
    noncard: HCLayout.Misc,
  };

  const multiLayoutToFaceLayout: Record<
    HCLayoutGroup.MultiFacedType & HCLayoutGroup.CardLayoutType,
    HCLayoutGroup.FaceLayoutType
  > = {
    meld_part: HCLayout.MeldResult,
    draft_partner: HCLayout.DraftPartner,
    reminder_on_back: HCLayout.Reminder,
    token_on_back: HCLayout.Token,
    token_in_inset: HCLayout.Token,
    dungeon_on_back: HCLayout.Dungeon,
    dungeon_in_inset: HCLayout.Dungeon,
    stickers_on_back: HCLayout.Stickers,
    modal: HCLayout.Modal,
    transform: HCLayout.Transform,
    specialize: HCLayout.Specialize,
    flip: HCLayout.Flip,
    inset: HCLayout.Inset,
    aftermath: HCLayout.Aftermath,
    prepare: HCLayout.Prepare,
    split: HCLayout.Split,
    multi: HCLayout.Split,
  };

  const borderColorTags: Record<string, HCBorderColor> = {
    'white-border': HCBorderColor.White,
    borderless: HCBorderColor.Borderless,
    'no-border': HCBorderColor.NoBorder,
    'silver-border': HCBorderColor.Silver,
    'gold-border': HCBorderColor.Gold,
    'yellow-border': HCBorderColor.Yellow,
    'rainbow-border': HCBorderColor.Rainbow,
    'blue-border': HCBorderColor.Blue,
    'unique-border': HCBorderColor.Unique,
    'orange-border': HCBorderColor.Orange,
    'red-border': HCBorderColor.Red,
  };

  const frameTags: Record<string, HCFrame> = {
    '1993-frame': HCFrame.Original,
    '1997-frame': HCFrame.Classic,
    '2003-frame': HCFrame.Modern,
    '2015-frame': HCFrame.Stamp,
    'future-frame': HCFrame.Future,
    'playtest-frame': HCFrame.Playtest,
    'jank-frame': HCFrame.Jank,
    '1997-token-frame': HCFrame.ClassicToken,
    '2003-token-frame': HCFrame.ModernToken,
    '2015-token-frame': HCFrame.StampToken,
    '2020-token-frame': HCFrame.NewToken,
    'pokemon-frame': HCFrame.Pokemon,
    'yugioh-frame': HCFrame.Yugioh,
    'legends-of-runeterra-frame': HCFrame.LegendsOfRuneterra,
    'slay-the-spire-frame': HCFrame.SlayTheSpire,
    'inscryption-frame': HCFrame.Inscryption,
    'hearthstone-frame': HCFrame.Hearthstone,
    'lorcana-frame': HCFrame.Lorcana,
    'notmagic-frame': HCFrame.NotMagic,
    'website-app-frame': HCFrame.WebsiteApp,
    'shattered-frame': HCFrame.Shattered,
  };
  const frameEffectTags: Record<string, HCFrameEffect> = {
    'miracle-frame': HCFrameEffect.Miracle,
    'nyx-frame': HCFrameEffect.Enchantment,
    'draft-frame': HCFrameEffect.Draft,
    'devoid-frame': HCFrameEffect.Devoid,
    tombstone: HCFrameEffect.Tombstone,
    'colorshifted-frame': HCFrameEffect.Colorshifted,
    'masterpiece-frame': HCFrameEffect.Masterpiece,
    'inverted-text': HCFrameEffect.Inverted,
    'sun-moon-transform': HCFrameEffect.SunMoonDfc,
    'type-transform-marks': HCFrameEffect.TypeDfc,
    'generic-transform-marks': HCFrameEffect.TransformDfc,
    'generic-mdfc-marks': HCFrameEffect.Mdfc,
    'compass-land-transform': HCFrameEffect.CompassLandDfc,
    'origin-pw-transform': HCFrameEffect.OriginPwDfc,
    'moon-eldrazi-transform': HCFrameEffect.MoonEldraziDfc,
    'fan-transform': HCFrameEffect.FanDfc,
    'showcase-frame': HCFrameEffect.Showcase,
    'extended-art': HCFrameEffect.ExtendedArt,
    'full-art': HCFrameEffect.FullArt,
    'vertical-art': HCFrameEffect.VerticalArt,
    'no-art': HCFrameEffect.NoArt,
    'companion-frame': HCFrameEffect.Companion,
    'etched-frame': HCFrameEffect.Etched,
    'spree-frame': HCFrameEffect.Spree,
    'meld-frame': HCFrameEffect.Meld,
    'slab-frame': HCFrameEffect.Slab,
    'arena-frame': HCFrameEffect.Arena,
  };

  const frontImageTagProps: Record<string, string> = {
    'draft-image': 'draft_image',
    'rotated-draft-image': 'rotated_draft_image',
    'still-draft-image': 'still_draft_image',
  };
  const faceImageTagProps: Record<string, string> = {
    'rotated-image': 'rotated_image',
    'still-image': 'still_image',
  };

  const allCards = rest.map(entry => {
    const cardObject: Record<string, any> & { card_faces: Record<string, any>[] } = {
      card_faces: [],
    };
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);

          if (face == 3 && entry[i].includes(' // ')) {
            const entryList = entry[i].split(' // ');
            entryList.forEach((value, index) => {
              while (cardObject.card_faces.length <= face + index) {
                cardObject.card_faces.push({} as Record<string, any>);
              }
              if (['supertypes', 'types', 'subtypes'].includes(key)) {
                cardObject.card_faces[face + index][key] = value.split(';');
              } else if (
                key == 'loyalty' &&
                cardObject.card_faces[face + index]['types']?.includes('Battle')
              ) {
                cardObject.card_faces[face + index].defense = value;
              } else {
                cardObject.card_faces[face + index][key] = value;
              }
              if (key == 'image') {
                cardObject.card_faces[face + index].image_status = HCImageStatus.HighRes;
              }
            });
          } else {
            while (cardObject.card_faces.length <= face) {
              cardObject.card_faces.push({} as Record<string, any>);
            }
            if (key == 'colors') {
              const colorArr = entry[i]
                .split(';')
                .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
              cardObject.card_faces[face][key] = colorArr;
              cardObject.colors = colorArr;
            } else if (['supertypes', 'types', 'subtypes'].includes(key)) {
              cardObject.card_faces[face][key] = entry[i].split(';');
            } else if (
              key == 'loyalty' &&
              cardObject.card_faces[face]['types']?.includes('Battle')
            ) {
              cardObject.card_faces[face].defense = entry[i];
            } else {
              cardObject.card_faces[face][key] = entry[i];
            }
            if (key == 'image') {
              cardObject.card_faces[face].image_status = HCImageStatus.HighRes;
            }
          }
        } else {
          if (keys[i] == 'mana_value') {
            cardObject[keys[i]] = entry[i] != '∞' ? parseInt(entry[i]) : 9999999999999999999999999; // The Infinitoken case
          } else if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Banned')
                ? cardObject.set.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              '4cb': formats.includes('Banned (4CB)')
                ? cardObject.set.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              commander: formats.includes('Banned (Commander)')
                ? cardObject.set.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
            };
            cardObject[keys[i]] = legalities;
          } else if (keys[i] == 'related') {
            const all_parts: HCRelatedCard[] = entry[i].split(';').map(oldName => {
              const [, name, count] = oldName.match(/(.*)(\*(?:\d+|x))$/) ?? [, oldName, undefined];
              const base = name.replace(/\d+$/, '');
              const shouldUseBase =
                /\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);

              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: shouldUseBase ? name : '',
                component: 'token_maker',
                name: shouldUseBase ? base : name,
                type_line: '',
                set: '',
                image: '',
              };
              if (count) {
                maker.count = count.slice(1);
              }
              return maker;
            });

            cardObject.all_parts = all_parts;
          } else if (keys[i] == 'tags') {
            // now handling this at the end
          } else if (keys[i] == 'creators' || keys[i] == 'artists') {
            cardObject[keys[i]] = entry[i].split(';');
          } else {
            cardObject[keys[i]] = entry[i];
          }
          if (keys[i] == 'image') {
            cardObject.image_status = HCImageStatus.HighRes;
          }
        }
      }
    }
    if (cardObject.card_faces.length == 0) {
      cardObject.card_faces.push({} as Record<string, any>);
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      /**
       * Adds a tag to a specific face
       * @param face face number (defaults to 0 if the face number is invalid)
       * @param prop prop to set/push the value to
       * @param value value to set/push
       * @param push whether to push the value (use true when the prop is an array)
       */
      const addTagToFace = (face: number, prop: string, value: string, push?: boolean) => {
        const faceIndex = face > 0 && face < cardObject.card_faces.length ? face : 0;
        if (push) {
          if (cardObject.card_faces[faceIndex][prop]) {
            cardObject.card_faces[faceIndex][prop].push(value);
          } else {
            cardObject.card_faces[faceIndex][prop] = [value];
          }
        } else {
          cardObject.card_faces[faceIndex][prop] = value;
        }
      };
      /**
       * Adds a tag to the card root
       * @param prop prop to set/push the value to
       * @param value value to set/push
       * @param push whether to push the value (use true when the prop is an array)
       */
      const addTagToRoot = (prop: string, value: string, push?: boolean) => {
        if (push) {
          if (cardObject[prop]) {
            cardObject[prop].push(value);
          } else {
            cardObject[prop] = [value];
          }
        } else {
          cardObject[prop] = value;
        }
      };
      /**
       * Adds a tag note
       * @param tag tag to add note to
       * @param note note to add
       * @param replaceNote whether to replace the note; if not true, will concat with '; '
       */
      const addTagNote = (tag: string, note: string, replaceNote?: boolean) => {
        if (!replaceNote && cardObject.tag_notes && cardObject.tag_notes[tag]) {
          cardObject.tag_notes[tag] += '; ' + note;
        } else {
          if (!cardObject.tag_notes) {
            cardObject.tag_notes = {} as Record<string, string>;
          }
          cardObject.tag_notes[tag] = note;
        }
      };

      /**
       * Adds a tag
       * @param tag tag to add
       * @param note tag note
       * @param prop prop to set
       * @param value value to set the prop to, or record to access with the tag to get the value
       * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
       */
      const addTag = (
        tag: string,
        note?: string,
        prop?: string,
        value?: Record<string, any> | string,
        options?: { dontAddNote?: boolean; replaceNote?:boolean, push?: boolean; useRootOnly?: boolean; useUrl?: boolean }
      ) => {
        if (note) {
          const useBoth = note.includes('|') && !options?.useRootOnly;
          const noteIsNum = Number.isInteger(Number(note)) && !options?.useRootOnly;
          const [face, subnote] = [
            useBoth ? parseInt(note.split('|')[0]) : noteIsNum ? parseInt(note) : undefined,
            useBoth ? note.split('|')[1] : noteIsNum ? undefined : note,
          ];
          const tagUrl =
            options?.useUrl && subnote
              ? subnote.slice(0, 4) == 'http'
                ? subnote
                : 'https://lh3.googleusercontent.com/d/' + subnote
              : undefined;
          if (face != undefined) {
            if (typeof value == 'string') {
              addTagToFace(face, prop!, value, options?.push);
            } else if (value) {
              addTagToFace(face, prop!, value[tag], options?.push);
            } else if (prop && subnote) {
              addTagToFace(face, prop, options?.useUrl ? tagUrl! : subnote, options?.push);
            }
          } else {
            if (typeof value == 'string') {
              addTagToRoot(prop!, value, options?.push);
            } else if (value) {
              addTagToRoot(prop!, value[tag], options?.push);
            } else if (prop) {
              addTagToRoot(prop, options?.useUrl ? tagUrl! : note, options?.push);
            }
          }
          if (subnote && !options?.useUrl && !options?.dontAddNote) {
            addTagNote(tag, subnote, options?.replaceNote);
          }
        } else {
          if (typeof value == 'string') {
            addTagToRoot(prop!, value, options?.push);
          } else if (value) {
            addTagToRoot(prop!, value[tag], options?.push);
          }
        }
      };
      const tags = entry[tagIndex].split(';');

      cardObject.tags = tags.map(fullTag => {
        if (fullTag.includes('<') && fullTag.endsWith('>')) {
          const [tag, note] = [fullTag.split('<')[0], fullTag.split('<')[1].slice(0, -1)];
          if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
            addTag(tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
          } else if (tag in frameTags) {
            addTag(tag, note, 'frame', frameTags);
          } else if (tag in frameEffectTags) {
            addTag(tag, note, 'frame_effects', frameEffectTags, { push: true });
          } else if (tag in faceImageTagProps) {
            addTag(tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
          } else if (tag in frontImageTagProps) {
            addTag(tag, note, frontImageTagProps[tag], undefined, {
              useUrl: true,
              useRootOnly: true,
            });
            if (tag == 'draft-image') {
              cardObject.draft_image_status = HCImageStatus.HighRes;
            }
          } else if (tag in borderColorTags) {
            addTag(tag, note, 'border_color', borderColorTags);
          } else if (tag == 'flavor-name') {
            addTag(tag, note, 'flavor_name', undefined,{dontAddNote:true});
          } else if (tag.toLowerCase() == cardObject.set.toLowerCase() || (['hc1.0','hc1.1','hc1.2'].includes(tag) && (cardObject.set.slice(0,3) == 'HLC' || cardObject.set == 'HCV.1'))) {
            addTag(tag, undefined, 'collector_number', note);
          } else {
            addTag(tag, note, undefined, undefined, { useRootOnly: true });
          }
          return tag;
        } else {
          if (fullTag.slice(fullTag.lastIndexOf('-') + 1) == 'watermark') {
            addTag(fullTag, undefined, 'watermark', fullTag.slice(0, fullTag.lastIndexOf('-')));
          } else if (fullTag in frameTags) {
            addTag(fullTag, undefined, 'frame', frameTags);
          } else if (fullTag in frameEffectTags) {
            addTag(fullTag, '0', 'frame_effects', frameEffectTags, { push: true });
          } else if (fullTag in borderColorTags) {
            addTag(fullTag, undefined, 'border_color', borderColorTags);
          }
          return fullTag;
        }
      });
      cardObject.tags = Array.from(new Set(cardObject.tags));

      cardObject.tags.forEach((tag: string) => {
        if (tag == 'draftpartner' && cardObject.all_parts) {
          cardObject.all_parts[0].is_draft_partner = true;
          if (cardObject.all_parts[0].component == 'token_maker') {
            // don't overwrite melds
            cardObject.all_parts[0].component = 'draft_partner';
          }
          if (!tags.includes('draftpartner-with-self')) {
            cardObject.not_directly_draftable = true;
          }
          cardObject.has_draft_partners = true;
        } else if (tag == 'meld' && cardObject.all_parts) {
          cardObject.all_parts[0].component = 'meld_part';
        } else if (tag == 'NotDirectlyDraftable') {
          // for Prismatic Pardner
          cardObject.not_directly_draftable = true;
        }
        if (!('layout' in cardObject)) {
          if (cardObject.card_faces.length <= 1) {
            if (tag in singleLayoutTags) {
              cardObject.layout = singleLayoutTags[tag];
            }
          } else {
            if (tag in multiLayoutTags) {
              cardObject.layout = multiLayoutTags[tag];
            }
          }
        }
        if (tag == 'foil') {
          cardObject.finish = HCFinish.Foil;
        }
      });
    }
    const name = cardObject.tags?.includes('irregular-face-name')
      ? []
      : (cardObject.card_faces.length > 1 && cardObject.tags?.includes('masterpiece')
          ? stripMasterpiece(entry[1])
          : entry[1]
        ).split(' // ');
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    cardObject.card_faces.forEach((face, index) => {
      face.name = name.length > 0 ? name.shift() : '';
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);

      // TODO: Expand
      if (index == 0) {
        face.layout = HCLayout.Front;
      } else if (
        'layout' in cardObject &&
        cardObject.layout != 'flip' &&
        cardObject.tags?.includes('flip') &&
        !face.image &&
        cardObject.layout in multiLayoutToFaceLayout
      ) {
        face.layout = 'flip';
      } else if (
        'layout' in cardObject &&
        cardObject.layout != 'inset' &&
        cardObject.tags?.includes('inset') &&
        !face.image &&
        cardObject.layout in multiLayoutToFaceLayout
      ) {
        face.layout = 'inset';
      } else if ('layout' in cardObject && cardObject.layout in multiLayoutToFaceLayout) {
        if (index == 1 && cardObject.layout == 'specialize') {
          face.layout == 'reminder';
        } else {
          face.layout =
            multiLayoutToFaceLayout[cardObject.layout as keyof typeof multiLayoutToFaceLayout];
        }
      } else {
        face.layout = HCLayout.Split;
      }
      if (!('image_status' in face) /**|| ['split'].includes(face.image_status)*/) {
        if (index == 0) {
          face.image_status = HCImageStatus.Front;
        } else if (cardObject.tags?.includes('draftpartner-faces')) {
          face.image_status = HCImageStatus.DraftPartner;
        } else if (
          // the inset check correctly handles mr. crime 1981
          cardObject.tags?.includes('reminder-on-back') &&
          !cardObject.tags?.includes('inset')
        ) {
          face.image_status = HCImageStatus.Reminder;
        } else if (
          cardObject.tags?.includes('dungeon-on-back') ||
          cardObject.tags?.includes('dungeon-in-inset')
        ) {
          face.image_status = HCImageStatus.Dungeon;
        } else if (cardObject.tags?.includes('stickers-on-back')) {
          face.image_status = HCImageStatus.Stickers;
        } else if (
          cardObject.tags?.includes('token-on-back') ||
          cardObject.tags?.includes('token-in-inset')
        ) {
          face.image_status = HCImageStatus.Token;
        } else if (cardObject.tags?.includes('flip')) {
          face.image_status = HCImageStatus.Flip;
        } else if (cardObject.tags?.includes('aftermath')) {
          face.image_status = HCImageStatus.Aftermath;
        } else if (cardObject.tags?.includes('inset')) {
          face.image_status = HCImageStatus.Inset;
        } else if (cardObject.tags?.includes('prepare')) {
          face.image_status = HCImageStatus.Prepare;
        } else {
          face.image_status = HCImageStatus.Split;
        }
      }
      Object.keys(defaultFaceProps)
        .filter(key => !(key in face))
        .forEach(key => {
          face[key] = defaultFaceProps[key];
        });
      mana_cost_list.push(face.mana_cost);
    });

    cardObject.type_line = type_line_list.join(' // ');
    cardObject.mana_cost = mana_cost_list.filter(e => e).join(' // ');

    Object.keys(defaultProps)
      .filter(key => !(key in cardObject))
      .forEach(key => {
        cardObject[key] = defaultProps[key];
      });
    if (cardObject.card_faces.length <= 1) {
      if (cardObject.card_faces[0].image) {
        // this should never happen. If it does, it means that an image needs to be moved to an image tag
        throw error;
      }
      for (const [key, value] of Object.entries(cardObject.card_faces[0]).filter(
        ([key, value]) =>
          ![
            'object',
            'name',
            'type_line',
            'mana_cost',
            'mana_value',
            'image_status',
            'colors',
            'image',
            'layout',
          ].includes(key)
      )) {
        cardObject[key] = value;
      }
      const { card_faces, ...singleCard } = cardObject;
      if (!('layout' in singleCard)) {
        if (singleCard.types?.some((type: string) => type.toLowerCase() == 'stickers')) {
          singleCard.layout = HCLayout.Stickers;
        } else if (singleCard.types?.some((type: string) => type.toLowerCase() == 'dungeon')) {
          singleCard.layout = HCLayout.Dungeon;
        } else if (singleCard.subtypes?.some((type: string) => type.toLowerCase() == 'saga')) {
          singleCard.layout = HCLayout.Saga;
        } else if (singleCard.subtypes?.some((type: string) => type.toLowerCase() == 'class')) {
          singleCard.layout = HCLayout.Class;
        } else if (singleCard.subtypes?.some((type: string) => type.toLowerCase() == 'case')) {
          singleCard.layout = HCLayout.Case;
        } else if (
          singleCard.tags?.some((type: string) =>
            ['plane', 'phenomenon'].includes(type.toLowerCase())
          )
        ) {
          singleCard.layout = HCLayout.Prototype;
        } else if (singleCard.types?.some((type: string) => type.toLowerCase() == 'plane')) {
          singleCard.layout = HCLayout.Planar;
        } else if (singleCard.types?.some((type: string) => type.toLowerCase() == 'scheme')) {
          singleCard.layout = HCLayout.Scheme;
        } else if (singleCard.types?.some((type: string) => type.toLowerCase() == 'vanguard')) {
          singleCard.layout = HCLayout.Vanguard;
        } else if (singleCard.types?.some((type: string) => type.toLowerCase() == 'battle')) {
          singleCard.layout = HCLayout.Battle;
        } else if (
          singleCard.subtypes?.some((subtype: string) =>
            ['spacecraft', 'watercraft', 'planet'].includes(subtype.toLowerCase())
          ) &&
          singleCard.oracle_text.toLowerCase().includes('station')
        ) {
          singleCard.layout = HCLayout.Station;
        } else {
          singleCard.layout = HCLayout.Normal;
        }
      }
      const card = singleCard as HCCard.AnySingleFaced;
      setDerivedProps(card);
      return card;
    } else {
      if (!('layout' in cardObject)) {
        cardObject.layout = HCLayout.Split;
      }
      const card = cardObject as HCCard.AnyMultiFaced;
      setDerivedProps(card);
      return card;
    }
  });

  return allCards;
};
