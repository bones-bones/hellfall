import {
  facePropType,
  faceValueType,
  HCCard,
  HCCardFace,
  HCFrameEffect,
  HCKind,
  rootPropType,
} from '@hellfall/shared/types';
import {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeType,
  createFaceChange,
  createRootChange,
  faceChangeableProps,
  faceChangeablePropType,
  isFaceArrayPropType,
  isRootArrayPropType,
  rootChangeableProps,
  rootChangeablePropType,
  sortChanges,
} from './changeTypes';
import {
  allPartsChangeIsValid,
  getPartChangeIndex,
  isFaceChangePropType,
  isFaceChangeValueType,
  isRootChangePropType,
  isRootChangeValueType,
} from './changeValidation';
import { toFaces } from '../cardHandling';
import { getBaseDiffs, getChangesFromTag } from './tagHandling';

// can add even if empty
const rootBlankableProps: Partial<Record<HCKind, rootPropType[]>> = {
  card: ['mana_cost', 'mana_value', 'rulings', 'collector_number'],
  notmagic: ['mana_cost', 'mana_value'],
};

const faceBlankableProps: Partial<Record<HCKind, facePropType[]>> = {
  card: ['mana_cost', 'mana_value', 'oracle_text'],
  notmagic: ['mana_cost', 'mana_value', 'oracle_text'],
};

// can delete
const rootRemovableProps: Partial<Record<HCKind, rootPropType[]>> = {
  card: [
    'id_is_scryfall',
    'oracle_id',
    'oracle_id_is_scryfall',
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'print_image_status',
    'print_image',
    'rotated_print_image',
    'still_print_image',
    'not_directly_draftable',
    'has_draft_partners',
    'creators',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'base_tags',
    'all_parts',
  ],
  token: [
    'id_is_scryfall',
    'oracle_id_is_scryfall',
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'print_image_status',
    'print_image',
    'rotated_print_image',
    'still_print_image',
    'not_directly_draftable',
    'has_draft_partners',
    'creators',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'base_tags',
    'all_parts',
  ],
  land: [
    // 'id_is_scryfall',
    // 'oracle_id_is_scryfall',
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'print_image_status',
    'print_image',
    'rotated_print_image',
    'still_print_image',
    'not_directly_draftable',
    'has_draft_partners',
    'creators',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'base_tags',
    'all_parts',
  ],
  notmagic: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'print_image_status',
    'print_image',
    'rotated_print_image',
    'still_print_image',
    'not_directly_draftable',
    'has_draft_partners',
    'creators',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'base_tags',
    'all_parts',
  ],
};
const faceRemovableProps: Partial<Record<HCKind, facePropType[]>> = {
  card: [
    'flavor_name',
    'export_name',
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
    'watermark',
    'frame',
    'frame_effects',
    'compress_face',
    'drop_face',
  ],
  token: [
    'flavor_name',
    'export_name',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'power',
    'toughness',
    'watermark',
    'frame',
    'frame_effects',
  ],
  land: [
    'flavor_name',
    'export_name',
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
    'watermark',
    'frame',
    'frame_effects',
  ],
  notmagic: [
    'flavor_name',
    'export_name',
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
    'watermark',
    'frame',
    'frame_effects',
  ],
};

const rootIgnoreProps: Record<HCKind, rootPropType[]> = {
  card: ['keywords', 'image_status', 'print_image_status'],
  token: ['mana_cost', 'mana_value', 'colors', 'rulings', 'image_status', 'print_image_status'],
  land: ['keywords', 'image_status', 'print_image_status'],
  front: ['keywords', 'image_status', 'print_image_status'],
  scryfall: [],
  notmagic: ['keywords', 'image_status', 'print_image_status'],
};
const faceIgnoreProps: Partial<Record<HCKind, facePropType[]>> = {
  // card: ['colors'],
  token: ['mana_cost', 'mana_value', 'subtypes', 'oracle_text', 'colors'],
  // land: ['colors'],
  // front: ['colors'],
  // scryfall: ['colors'],
  // notmagic: ['colors'],
};
type add = faceChangeablePropType<'add'>;

/**
 * Gets a list of changes from the differences between existing and new versions of a card
 * @param existingCard existing version of the card
 * @param newCard new version of the card
 * @param pullingFromSheet whether the new version is coming from the google sheet (if it is, will ignore differences caused by lack of data storage in the sheet)
 */
export const getChangesFromDifferences = (
  existingCard: HCCard.Any,
  newCard: HCCard.Any,
  pullingFromSheet?: boolean
): anyChange[] => {
  const changeList: anyChange[] = [];
  (
    Object.entries(rootChangeableProps) as [
      changeType,
      rootChangeablePropType<'add' | 'delete'>[]
    ][]
  ).forEach(([change_type, props]) => {
    props.forEach(prop => {
      const value = newCard[prop];
      if (pullingFromSheet) {
        if (
          change_type == 'add' &&
          !value &&
          !rootBlankableProps[existingCard.kind]?.includes(prop)
        )
          return;
        if (rootIgnoreProps[existingCard.kind]?.includes(prop)) return;
        if (change_type == 'delete' && !rootRemovableProps[existingCard.kind]?.includes(prop))
          return;
        // if (prop == 'image_status') return
      }
      if (!isRootArrayPropType(prop)) {
        if (!isRootChangePropType(change_type, prop)) return;
        if (!isRootChangeValueType(change_type, prop, value, existingCard[prop])) return;
        changeList.push(createRootChange(change_type, prop, value));
      } else {
        if (!isRootChangePropType(change_type, prop)) return;
        const intValues = (change_type == 'add' ? newCard : existingCard)[prop];
        if (intValues == undefined) return;
        const values = Array.isArray(intValues) ? intValues : Object.entries(intValues);
        values.forEach(value => {
          if (
            !isRootChangeValueType(
              change_type,
              prop,
              value,
              (change_type == 'add' ? existingCard : newCard)[prop],
              true
            )
          )
            return;
          changeList.push(createRootChange(change_type, prop, value));
        });
      }
    });
  });
  // if ('card_faces' in existingCard != 'card_faces' in newCard) {
  //   throw console.error('You really shouldn\'t try to use this to compare between single cards and multiface cards.')
  // }
  for (
    let index = 0;
    index <
    Math.max(
      'card_faces' in existingCard ? existingCard.card_faces.length : 1,
      'card_faces' in newCard ? newCard.card_faces.length : 1
    );
    index++
  ) {
    const existingFace = toFaces(existingCard)[index];
    const newFace = toFaces(newCard)[index];
    if (!existingFace) {
      const change: cardFacesChange = {
        location: 'card_faces',
        index,
        change_type: 'add',
        face: newFace as HCCardFace.MultiFaced,
      };
      changeList.push(change);
      continue;
    }
    if (!newFace) {
      const change: cardFacesChange = {
        location: 'card_faces',
        index,
        change_type: 'delete',
      };
      changeList.push(change);
      continue;
    }
    const noBlank = <K extends add>(prop: K, value?: faceValueType<K>) => {
      if (!value && !faceBlankableProps[existingCard.kind]?.includes(prop)) {
        return true;
      }
      if (Array.isArray(value) && !value.length) {
        return true;
      }
      if (prop == 'colors') {
        if ('color_indicator' in newFace || 'color_indicator' in existingFace) {
          return true;
        }
        if (
          existingFace.frame_effects?.includes(HCFrameEffect.Devoid) ||
          existingCard.frame_effects?.includes(HCFrameEffect.Devoid)
        ) {
          return true;
        }
      }
    };
    (
      Object.entries(faceChangeableProps) as [
        changeType,
        faceChangeablePropType<'add' | 'delete'>[]
      ][]
    ).forEach(([change_type, props]) => {
      props.forEach(prop => {
        const value = newFace[prop];
        if (pullingFromSheet) {
          if (change_type == 'add' && noBlank(prop as add, value)) return;
          if (faceIgnoreProps[existingCard.kind]?.includes(prop)) return;
          if (change_type == 'delete' && !faceRemovableProps[existingCard.kind]?.includes(prop))
            return;
          if (prop == 'image_status' && newFace.image) return;
        }
        if (!isFaceArrayPropType(prop)) {
          if (!isFaceChangePropType(change_type, prop)) return;
          if (!isFaceChangeValueType(change_type, prop, value, existingFace[prop])) return;
          changeList.push(createFaceChange(change_type, prop, value, index));
        } else {
          if (!isFaceChangePropType(change_type, prop)) return;
          const values = (change_type == 'add' ? newFace : existingFace)[prop];
          if (values == undefined) return;
          values.forEach(v => {
            if (!isFaceChangeValueType(change_type, prop, v, existingFace[prop], true)) return;
            changeList.push(createFaceChange(change_type, prop, v, index));
          });
        }
      });
    });
  }

  const foundIndices: number[] = [];
  newCard.all_parts?.forEach(newPart => {
    const change: allPartsChange = {
      location: 'all_parts',
      change_type: 'add',
      related: newPart,
    };
    if (pullingFromSheet) {
      change.no_blank = true;
    }
    const index = getPartChangeIndex(existingCard, change);
    if (index != undefined) {
      foundIndices.push(index);
      if (allPartsChangeIsValid(existingCard, change, index)) {
        changeList.push(change);
      }
    } else {
      changeList.push(change);
    }
  });
  existingCard.all_parts
    ?.filter((part, i) => !foundIndices.includes(i))
    .forEach(part => {
      const change: allPartsChange = {
        location: 'all_parts',
        change_type: 'delete',
      };
      if (part.id) {
        change.id = part.id;
      } else if (part.hcid) {
        change.id = part.hcid;
        change.part_prop = 'hcid';
      } else if (part.name) {
        change.id = part.name;
        change.part_prop = 'name';
      } else {
        return;
      }
      changeList.push(change);
    });
  const { added, deleted } = getBaseDiffs(existingCard.base_tags ?? [], newCard.base_tags ?? []);
  const alsoAddingFaces = changeList.some(
    change => change.location == 'card_faces' && change.change_type == 'add'
  );
  changeList.push(
    ...added.flatMap(tag => getChangesFromTag(existingCard, 'add', tag, alsoAddingFaces)[0] ?? [])
  );
  changeList.push(
    ...deleted.flatMap(
      tag => getChangesFromTag(existingCard, 'delete', tag, alsoAddingFaces)[0] ?? []
    )
  );
  return changeList.sort(sortChanges);
};
