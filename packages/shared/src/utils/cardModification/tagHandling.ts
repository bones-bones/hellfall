import {
  HCBorderColor,
  HCCard,
  HCFinish,
  HCFrame,
  HCFrameEffect,
  HCImageStatus,
  HCLayout,
  HCLayoutGroup,
  SetCode,
  // tagRecord,
  // tagState,
} from '@hellfall/shared/types';
import {
  addLayoutTag,
  addPropToRoot,
  addTag,
  addTagNote,
  deletePropFromFace,
  deletePropFromRoot,
  layoutTags,
  layoutTagType,
} from './modificationHandling';
import { anyPropType, facePropType, faceType, rootPropType } from '../cardHandling';
import { doubleListEquals, pushProp, pushPropToRecord, pushToRecord } from '../listHandling';
import {
  kindToDefaultFrame,
  kindToFaceLayout,
  kindToMultiLayout,
  layoutIsDefault,
} from './defaults';
import { getSet } from '../setHandling';

const frameTags: Record<string, HCFrame> = {
  'future-frame': HCFrame.Future,
  'playtest-frame': HCFrame.Playtest,
  'jank-frame': HCFrame.Jank,
  'pokemon-frame': HCFrame.Pokemon,
  'yugioh-frame': HCFrame.Yugioh,
  'legends-of-runeterra-frame': HCFrame.LegendsOfRuneterra,
  'slay-the-spire-frame': HCFrame.SlayTheSpire,
  'inscryption-frame': HCFrame.Inscryption,
  'hearthstone-frame': HCFrame.Hearthstone,
  'lorcana-frame': HCFrame.Lorcana,
  'balatro-frame': HCFrame.Balatro,
  'tarot-frame': HCFrame.Tarot,
  'notmagic-frame': HCFrame.NotMagic,
  'website-app-frame': HCFrame.WebsiteApp,
  'shattered-frame': HCFrame.Shattered,
};

const cardFrameTags: Record<string, HCFrame> = {
  '1993-frame': HCFrame.Original,
  '1997-frame': HCFrame.Classic,
  '2003-frame': HCFrame.Modern,
  '2015-frame': HCFrame.Stamp,
  '1997-token-frame': HCFrame.ClassicToken,
  '2003-token-frame': HCFrame.ModernToken,
  '2015-token-frame': HCFrame.StampToken,
  '2020-token-frame': HCFrame.FullToken,
};
const tokenFrameTags: Record<string, HCFrame> = {
  '1993-card-frame': HCFrame.Original,
  '1997-card-frame': HCFrame.Classic,
  '2015-card-frame': HCFrame.Stamp,
  '2003-card-frame': HCFrame.Modern,
  '1997-frame': HCFrame.ClassicToken,
  '2003-frame': HCFrame.ModernToken,
  '2015-frame': HCFrame.StampToken,
  '2020-frame': HCFrame.FullToken,
};
export const frameEffectTags: Record<string, HCFrameEffect> = {
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
  'universes-beyond-frame': HCFrameEffect.UniversesBeyond,
};
const frontImageTagProps: Record<string, string> = {
  'draft-image': 'draft_image',
  'rotated-draft-image': 'rotated_draft_image',
  'still-draft-image': 'still_draft_image',
};
const faceImageTagProps: Record<string, facePropType> = {
  'rotated-image': 'rotated_image',
  'still-image': 'still_image',
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

const removableTagProps: anyPropType[] = [
  'flavor_name',
  'watermark',
  'frame_effects',
  'rotated_image',
  'still_image',
  'draft_image',
  'draft_image_status',
  'rotated_draft_image',
  'still_draft_image',
  'tag_notes',
];
const removableFaceTagProps: facePropType[] = ['finish', 'border_color', 'frame'];

const setTagPropsToDefault = (card: HCCard.Any) => {
  removableTagProps.forEach(prop => deletePropFromRoot(card, prop as rootPropType));
  card.finish = HCFinish.Nonfoil;
  card.border_color = HCBorderColor.Black;
  card.frame = kindToDefaultFrame[card.kind];
  if ('card_faces' in card) {
    card.layout = kindToMultiLayout[card.kind];
    card.card_faces.forEach((face, i) => {
      removableTagProps.forEach(prop => deletePropFromFace(card, prop as facePropType, i));
      removableFaceTagProps.forEach(prop => deletePropFromFace(card, prop, i));
      face.layout = card.kind == 'card' && i ? HCLayout.Multi : kindToFaceLayout[card.kind];
      if (!face.image) {
        face.image_status = i ? HCImageStatus.Inapplicable : HCImageStatus.Front;
      }
    });
  } else {
    card.layout = kindToFaceLayout[card.kind];
  }
};

const tokenTypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  emblem: HCLayout.Emblem,
  // 'reminder card': HCLayout.Reminder,
  stickers: HCLayout.Stickers,
  dungeon: HCLayout.Dungeon,
  // 'real card': HCLayout.RealCardToken,
  'ad card': HCLayout.Misc,
  misc: HCLayout.Misc,
  checklist: HCLayout.Checklist,
};
const typeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  plane: HCLayout.Planar,
  phenomenon: HCLayout.Planar,
  scheme: HCLayout.Scheme,
  vanguard: HCLayout.Vanguard,
  battle: HCLayout.Battle,
};
const subtypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  saga: HCLayout.Saga,
  class: HCLayout.Class,
  case: HCLayout.Case,
  spacecraft: HCLayout.Station,
  watercraft: HCLayout.Station,
  planet: HCLayout.Station,
};

const setFacePropsFromTypes = (face: faceType, shouldSetLayout: boolean, isTokenRoot?: boolean) => {
  if (shouldSetLayout) {
    const tokenType = face.types
      ?.find(type => type.toLowerCase() in tokenTypeLayouts)
      ?.toLowerCase();
    if (tokenType) {
      face.layout = tokenTypeLayouts[tokenType];
      return;
    } else if (isTokenRoot) {
      return;
    }
    const type = face.types?.find(type => type.toLowerCase() in typeLayouts)?.toLowerCase();
    if (type) {
      face.layout = subtypeLayouts[type];
      return;
    }

    const subtype = face.subtypes
      ?.find(type => type.toLowerCase() in subtypeLayouts)
      ?.toLowerCase();
    if (subtype) {
      face.layout = subtypeLayouts[subtype];
      return;
    }
  }
};

export const splitFullTag = (fullTag: string) => {
  const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
  const [tag, note] = [
    (hasNote ? fullTag.split('<')[0] : fullTag).trim(),
    hasNote ? fullTag.split('<')[1].slice(0, -1).trim() : undefined,
  ];
  return { tag, note };
};

export const tagChangesVisibleProps = (fullTag:string): boolean => {
  const {tag} = splitFullTag(fullTag);
  if (tag in faceImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag == 'back-image') {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (getSet(tag.toUpperCase() as SetCode) || ['hc1.0', 'hc1.1', 'hc1.2'].includes(tag)) {
    return true;
  }
  return false;
}

export const tagChangesAnyProps = (fullTag:string): boolean => {
  const {tag} = splitFullTag(fullTag);
  if (tagChangesVisibleProps(tag)) {
    return true;
  }
  if (tag in frameTags) {
    return true;
  }
  if (tag in cardFrameTags) {
    return true;
  }
  if (tag in tokenFrameTags) {
    return true;
  }
  if (tag in frameEffectTags) {
    return true;
  }
  if (tag in borderColorTags) {
    return true;
  }
  if (layoutTags.includes(tag as layoutTagType)) {
    return true;
  }
  if (tag == 'foil') {
    return true;
  }
  return false;
}

// // export const addTagToState = (state: tagState, tag: string):boolean => {
// //   const tagToAdd = splitFullTag(tag).tag
// //   pushPropToRecord(state!, 'added', tagToAdd, tag);
// //   return tagChangesVisibleProps(tagToAdd)
// // };
// // export const deleteTagFromState = (state: tagState, tag: string):boolean => {
// //   const tagToDelete = splitFullTag(tag).tag;
// //   if (state?.added?.[tagToDelete]) {
// //     delete state.added[tagToDelete];
// //   } else if (state?.base_tags?.[tagToDelete] && !state.deleted?.includes(tagToDelete)) {
// //     pushProp(state, 'deleted', tagToDelete);
// //   } else {
// //     return false;
// //   }
// //   return tagChangesVisibleProps(tagToDelete)
// // };

// export const mergeTagStates = (into: tagState, donor: tagState): tagState => {
//   const state: tagState = structuredClone(into);
//   if (donor.added) {
//     Object.values(donor.added).forEach(tags => tags.forEach(tag => addTagToState(state, tag)));
//   }
//   if (donor.deleted) {
//     donor.deleted.forEach(tag => deleteTagFromState(state, tag));
//   }
//   return state;
// };

export const addTagToBase = (base_tags: string[], fullTag: string):boolean => {
  if (!base_tags.includes(fullTag)) {
    base_tags.push(fullTag)
    return tagChangesVisibleProps(fullTag)
  }
  return false;
};

export const deleteTagFromBase = (base_tags: string[], fullTag: string):boolean => {
  const {tag, note} = splitFullTag(fullTag);
  let changesVisible = false
  for (let i = base_tags.length-1;i>=0;i--) {
    if (splitFullTag(base_tags[i]).tag == tag && (note == undefined || note == (splitFullTag(base_tags[i]).note ?? ''))) {
      base_tags.splice(i,1);
      if (tagChangesVisibleProps(tag)) {
        changesVisible = true;
      }
    }
  }
  return changesVisible;
};

// export const replaceTagInBase = (base_tags: string[], fullTag: string, noteToReplace?:string):boolean => {
//   const {tag, note} = splitFullTag(fullTag)
//   if (note == 'undefined') {

//   }
  
// };

const getBaseDiffs = (oldBase:string[], newBase:string[]): {added:string[], deleted:string[]} =>  {
  const added:string[] = newBase.filter(tag=>!oldBase.includes(tag));
  const deleted:string[] = oldBase.filter(tag=>!newBase.includes(tag));
  return {added, deleted}
}

const getMergedTags = (oldTags:string[],newTags:string[]): {mergedTags:string[], shouldDeriveProps:boolean} => {
  let shouldDeriveProps = false;
  // TODO: implement this on the frontend too
  // TODO: move error to correct spot
  // if (card.kind == 'scryfall') throw console.error("Can't set tags for scryfall cards");
  const mergedTags = [...oldTags];
  const {added, deleted} = getBaseDiffs(oldTags,newTags)
  deleted.forEach(fullTag=>{
    if (deleteTagFromBase(mergedTags,fullTag)) {
      shouldDeriveProps = true;
    }
  })
  added.forEach(fullTag=>{
    if (addTagToBase(mergedTags,fullTag)) {
      shouldDeriveProps = true;
    }
  })
  return {mergedTags, shouldDeriveProps}

};

const setPropsFromTags = (card: HCCard.Any, tags: string[], shouldDeriveProps?:boolean) => {
  if (card.kind == 'scryfall') return;
  if (!shouldDeriveProps) {
    deletePropFromRoot(card, 'tag_notes');
    if (!tags.length /* || (tags.length == 1 && tags[0] == '') */) {
      deletePropFromRoot(card, 'tags');
      return;
    }
    card.tags = tags.map(fullTag => {
      const { tag, note } = splitFullTag(fullTag);
      if (note) {
        addTagNote(card, tag, note)
      }
      return tag;
    });
    card.tags = Array.from(new Set(card.tags));
    return;
  }
  setTagPropsToDefault(card);
  deletePropFromRoot(card, 'tag_notes');
  if (!tags.length /* || (tags.length == 1 && tags[0] == '') */) {
    deletePropFromRoot(card, 'tags');
    // deletePropFromRoot(card, 'tag_state');
    if ('card_faces' in card) {
      card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
    } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
    return;
  }
  // if (setBaseTags || !card.tag_state) {
  //   addPropToRoot(card, 'tag_state', {});
  // }
  card.tags = tags.map(fullTag => {
    const { tag, note } = splitFullTag(fullTag);
    // if (setBaseTags) {
    //   pushPropToRecord(card.tag_state!, 'base_tags', tag, fullTag);
    // }
    if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
      addTag(card, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
    } else if (tag in frameTags) {
      addTag(card, tag, note, 'frame', frameTags);
    } else if (tag in cardFrameTags && card.kind != 'token') {
      addTag(card, tag, note, 'frame', cardFrameTags);
    } else if (tag in tokenFrameTags && card.kind == 'token') {
      addTag(card, tag, note, 'frame', tokenFrameTags);
    } else if (tag in frameEffectTags) {
      addTag(card, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
    } else if (tag in faceImageTagProps) {
      addTag(card, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
    } else if (tag in borderColorTags) {
      addTag(card, tag, note, 'border_color', borderColorTags);
    } else if (layoutTags.includes(tag as layoutTagType)) {
      addLayoutTag(card, tag, note);
    } else if (tag == 'foil') {
      addTag(card, tag, note, 'finish', HCFinish.Foil);
    } else if (note) {
      if (tag in frontImageTagProps) {
        addTag(card, tag, note, frontImageTagProps[tag] as rootPropType, undefined, {
          useUrl: true,
          useRootOnly: true,
        });
        if (tag == 'draft-image') {
          addPropToRoot(card, 'draft_image_status', HCImageStatus.HighRes);
        }
      } else if (tag == 'back-image') {
        addTag(card, tag, note, 'image', undefined, { useUrl: true, defaultToBack: true });
      } else if (tag == 'flavor-name') {
        addTag(card, tag, note, 'flavor_name', undefined, { dontAddNote: true });
      } else if (
        tag.toLowerCase() == card.set?.toLowerCase() ||
        (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
          (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
      ) {
        addTag(card, tag, undefined, 'collector_number', note);
      } else {
        addTag(card, tag, note, undefined, undefined, { useRootOnly: true });
      }
    }
    return tag;
  });

  card.tags = Array.from(new Set(card.tags));
  if ('card_faces' in card) {
    card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
  } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
};

export const setTags = (card: HCCard.Any, newBase:string[], forceDerivedProps?:boolean) => {
  const base:string[] = card.base_tags ?? [];
  const fixedNew =  newBase.length == 1 && newBase[0] == '' ? [] : newBase
  const {mergedTags, shouldDeriveProps} = getMergedTags(base, fixedNew)
  if (mergedTags.length) {
    addPropToRoot(card,'base_tags',mergedTags)
  } else {
    deletePropFromRoot(card,'base_tags')
  }
  setPropsFromTags(card,mergedTags,shouldDeriveProps || forceDerivedProps);
}


// export const handleTags = (card: HCCard.Any, tagState: tagState, setBaseTags?: boolean, deriveInvisibleProps?:boolean) => {
//   if (card.kind == 'scryfall') return;
//   setTagPropsToDefault(card);
//   const shouldDeriveProps:'all'|'visible'|false|undefined = deriveInvisibleProps ? 
//   if (!tags.length || (tags.length == 1 && tags[0] == '')) {
//     deletePropFromRoot(card, 'tags');
//     deletePropFromRoot(card, 'tag_notes');
//     deletePropFromRoot(card, 'tag_state');
//     if ('card_faces' in card) {
//       card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//     } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
//     return;
//   }
//   if (setBaseTags || !card.tag_state) {
//     addPropToRoot(card, 'tag_state', {});
//   }
//   card.tags = tags.map(fullTag => {
//     const { tag, note } = splitFullTag(fullTag);
//     if (setBaseTags) {
//       pushPropToRecord(card.tag_state!, 'base_tags', tag, fullTag);
//     }
//     if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
//       addTag(card, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
//     } else if (tag in frameTags) {
//       addTag(card, tag, note, 'frame', frameTags);
//     } else if (tag in cardFrameTags && card.kind != 'token') {
//       addTag(card, tag, note, 'frame', cardFrameTags);
//     } else if (tag in tokenFrameTags && card.kind == 'token') {
//       addTag(card, tag, note, 'frame', tokenFrameTags);
//     } else if (tag in frameEffectTags) {
//       addTag(card, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
//     } else if (tag in faceImageTagProps) {
//       addTag(card, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
//     } else if (tag in borderColorTags) {
//       addTag(card, tag, note, 'border_color', borderColorTags);
//     } else if (layoutTags.includes(tag as layoutTagType)) {
//       addLayoutTag(card, tag, note);
//     } else if (tag == 'foil') {
//       addTag(card, tag, note, 'finish', HCFinish.Foil);
//     } else if (note) {
//       if (tag in frontImageTagProps) {
//         addTag(card, tag, note, frontImageTagProps[tag] as rootPropType, undefined, {
//           useUrl: true,
//           useRootOnly: true,
//         });
//         if (tag == 'draft-image') {
//           addPropToRoot(card, 'draft_image_status', HCImageStatus.HighRes);
//         }
//       } else if (tag == 'back-image') {
//         addTag(card, tag, note, 'image', undefined, { useUrl: true, defaultToBack: true });
//       } else if (tag == 'flavor-name') {
//         addTag(card, tag, note, 'flavor_name', undefined, { dontAddNote: true });
//       } else if (
//         tag.toLowerCase() == card.set?.toLowerCase() ||
//         (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
//           (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
//       ) {
//         addTag(card, tag, undefined, 'collector_number', note);
//       } else {
//         addTag(card, tag, note, undefined, undefined, { useRootOnly: true });
//       }
//     }
//     return tag;
//   });

//   card.tags = Array.from(new Set(card.tags));
//   if ('card_faces' in card) {
//     card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//   } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
// };


// export const addTagContributor = (card: HCCard.Any, tag: string) => {
//   if (!card.tag_state) {
//     addPropToRoot(card, 'tag_state', {});
//   }
//   pushPropToRecord(card.tag_state!, 'added', splitFullTag(tag).tag, tag);
//   mergeTags(card);
// };
// export const deleteTagContributor = (card: HCCard.Any, tag: string) => {
//   const tagToDelete = splitFullTag(tag).tag;
//   if (card.tag_state?.added?.[tagToDelete]) {
//     delete card.tag_state.added[tagToDelete];
//   } else if (
//     card.tag_state?.base_tags?.[tagToDelete] &&
//     !card.tag_state.deleted?.includes(tagToDelete)
//   ) {
//     pushProp(card.tag_state, 'deleted', tagToDelete);
//   } else {
//     return;
//   }
//   mergeTags(card);
// };

// export const tagRecordsEqual = (record1?: tagRecord, record2?: tagRecord): boolean => {
//   if (!record1 || !record2) {
//     return !record1 == !record2;
//   }
//   if (!doubleListEquals(Object.keys(record1), Object.keys(record2))) {
//     return false;
//   }
//   Object.keys(record1).forEach(tag => {
//     if (!doubleListEquals(record1[tag], record2[tag])) {
//       return false;
//     }
//   });
//   return true;
// };

// /**
//  * Returns true if the tags changed and false otherwise
//  */
// export const updateTags = (card: HCCard.Any, state: tagState): boolean => {
//   let shouldMerge = false;
//   if (!tagRecordsEqual(card.tag_state?.base_tags, state.base_tags)) {
//     shouldMerge = true;
//     if (!state.base_tags) {
//       delete card.tag_state?.base_tags;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.base_tags = state.base_tags;
//     }
//   }
//   if (!tagRecordsEqual(card.tag_state?.added, state.added)) {
//     shouldMerge = true;
//     if (!state.added) {
//       delete card.tag_state?.added;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.added = state.added;
//     }
//   }
//   if (
//     !card.tag_state?.deleted != !state.deleted ||
//     (card.tag_state?.deleted &&
//       state.deleted &&
//       !doubleListEquals(card.tag_state.deleted, state.deleted))
//   ) {
//     shouldMerge = true;
//     if (!state.deleted) {
//       delete card.tag_state?.deleted;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.deleted = state.deleted;
//     }
//   }
//   if (shouldMerge) {
//     mergeTags(card);
//   }
//   return shouldMerge;
// };
