import { HCBorderColor, HCCard, HCCardFace, HCFinish, HCFrame, HCFrameEffect, HCImageStatus, HCLayout, HCLayoutGroup } from "@hellfall/shared/types";
import { addLayoutTag, addProp, addTag, addTagToFace, deleteProp, deletePropFromFace, layoutIsDefault, layoutTags, layoutTagType } from "./fetchUtils";
import { facePropType, faceType, faceValueType, propType, valueType } from "../cardHandling";
import { listShareLower } from "../listHandling";
import { setDerivedProps } from "./derivedProps";




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



const removableTagProps: propType[]=['flavor_name','watermark','frame_effects', 'rotated_image','still_image','draft_image', 'draft_image_status','rotated_draft_image','still_draft_image']
const removableFaceTagProps: facePropType[]=['finish','border_color', 'frame']

const setTagPropsToDefault = (card:HCCard.Any) =>{
  removableTagProps.forEach(prop=> deleteProp(card,prop))
  card.finish = HCFinish.Nonfoil;
  card.border_color = HCBorderColor.Black;
  card.frame = card.isActualToken ? HCFrame.FullToken : HCFrame.Stamp
  if ('card_faces' in card) {
    card.layout = card.isActualToken ? HCLayout.MultiToken : HCLayout.Multi;
    card.card_faces.forEach((face,i)=> {
      removableTagProps.forEach(prop=> deletePropFromFace(card,prop as facePropType,i))
      removableFaceTagProps.forEach(prop=> deletePropFromFace(card,prop,i))
      face.layout = card.isActualToken ? HCLayout.Token : i ? HCLayout.Multi : HCLayout.Normal
      if (!face.image) {
        face.image_status= i ? 'inapplicable' : 'front'
      }
    })
  } else {
    card.layout = card.isActualToken ? HCLayout.Token : card.set.startsWith('FHCJ')? HCLayout.Front : HCLayout.Normal
  }
}


// const tokenMultiLayoutToFaceLayout: Record<
//   HCLayoutGroup.MultiFacedType & HCLayoutGroup.TokenLayoutType,
//   HCLayoutGroup.FaceLayoutType & HCLayoutGroup.SingleFacedType
// > = {
//   multi_reminder: HCLayout.Reminder,
//   multi_not_magic: HCLayout.NotMagic,
//   multi_token: HCLayout.Token,
//   real_card_multi_token: HCLayout.RealCardToken,
// };
const tokenTypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> =
{
  emblem: HCLayout.Emblem,
  // 'reminder card': HCLayout.Reminder,
  stickers: HCLayout.Stickers,
  dungeon: HCLayout.Dungeon,
  // 'real card': HCLayout.RealCardToken,
  'ad card': HCLayout.Misc,
  misc: HCLayout.Misc,
  checklist: HCLayout.Checklist,
};
const typeLayouts:Record<string,HCLayoutGroup.FaceLayoutType> = {
  plane:HCLayout.Planar,
  phenomenon:HCLayout.Planar,
  scheme:HCLayout.Scheme,
  vanguard:HCLayout.Vanguard,
  battle:HCLayout.Battle
}
const subtypeLayouts:Record<string,HCLayoutGroup.FaceLayoutType> = {
  saga:HCLayout.Saga,
  class:HCLayout.Class,
  case:HCLayout.Case,
  spacecraft:HCLayout.Station,
  watercraft:HCLayout.Station,
  planet:HCLayout.Station
}


const setFacePropsFromTypes = (face:faceType, shouldSetLayout:boolean, isTokenRoot?:boolean)=> {
  if (shouldSetLayout) {
    const tokenType = face.types?.find(type=>type.toLowerCase() in tokenTypeLayouts)?.toLowerCase();
    if (tokenType) {
      face.layout = tokenTypeLayouts[tokenType]
      return
    } else if (isTokenRoot) {
      return
    }
    const type = face.types?.find(type=>type.toLowerCase() in typeLayouts)?.toLowerCase();
    if (type) {
      face.layout = subtypeLayouts[type]
      return
    }
    
    const subtype = face.subtypes?.find(type=>type.toLowerCase() in subtypeLayouts)?.toLowerCase();
    if (subtype) {
      face.layout = subtypeLayouts[subtype]
      return
    }
  }
}

export const handleTags = (card:HCCard.Any, tags:string[]) => {
  setTagPropsToDefault(card);
  card.tags = tags.map(fullTag => {
    const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
    const [tag, note] = [
      hasNote ? fullTag.split('<')[0] : fullTag,
      hasNote ? fullTag.split('<')[1].slice(0, -1) : undefined,
    ];
    if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
      addTag(card, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
    } else if (tag in frameTags) {
      addTag(card, tag, note, 'frame', frameTags);
    } else if (tag in cardFrameTags && !card.isActualToken) {
      addTag(card, tag, note, 'frame', cardFrameTags);
    } else if (tag in tokenFrameTags && card.isActualToken) {
      addTag(card, tag, note, 'frame', tokenFrameTags);
    } else if (tag in frameEffectTags) {
      addTag(card, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
    } else if (tag in faceImageTagProps) {
      addTag(card, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
    } else if (tag in borderColorTags) {
      addTag(card, tag, note, 'border_color', borderColorTags);
    } else if (layoutTags.includes(tag as layoutTagType)) {
      addLayoutTag(card,tag,note)
    } else if (tag == 'foil') {
      addTag(card, tag, note, 'finish', HCFinish.Foil);
    } else if (note) {
      if (tag in frontImageTagProps) {
        addTag(card, tag, note, frontImageTagProps[tag] as propType, undefined, {
          useUrl: true,
          useRootOnly: true,
        });
        if (tag == 'draft-image') {
          addProp(card, 'draft_image_status', HCImageStatus.HighRes);
        }
      } else if (tag == 'back-image') {
        addTag(card, tag, note, 'image', undefined, {useUrl: true,defaultToBack: true,});
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
  })

  card.tags = Array.from(new Set(card.tags));
  if ('card_faces' in card) {
    card.card_faces.forEach((face,i)=>setFacePropsFromTypes(face,layoutIsDefault(card,i)))
  } else (
    setFacePropsFromTypes(card,layoutIsDefault(card),card.isActualToken)
  )
}