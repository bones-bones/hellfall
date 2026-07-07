import type {
  anyPropType,
  faceElementValueType,
  facePropType,
  HCCardFace,
  HCRelatedCard,
  rootElementValueType,
  rootPropType,
} from '@hellfall/shared/types';
import { Timestamp } from '@google-cloud/firestore';

const changeTypeList = ['add', 'delete'] as const;
/**
 * The type of change. Add is used for adding a new prop or completely overwriting an old one, or for pushing a value to a list or record; delete is for completely deleting a prop, or for removing a value from a list or record
 */
export type changeType = (typeof changeTypeList)[number];
export const isChangeType = (value: any): value is changeType => changeTypeList.includes(value);

const changeLocationList = ['root', 'face', 'card_faces', 'all_parts', 'tag'] as const;
/**
 * The location of the change. 'root' is for changes that affect the card root; 'face' is for changes that would affect a face; 'card_faces' is for changes that add/delete card faces; 'all_parts' is for changes to related cards; and 'tag' is for tag changes
 *
 * For single-faced cards, changes use root and/or face depending on whether their prop would be on the root or the face of a multifaced card
 */
export type changeLocation = (typeof changeLocationList)[number];

export const isChangeLocation = (value: any): value is changeLocation =>
  changeLocationList.includes(value);

const rootAddProps = [
  'id_is_scryfall',
  'oracle_id',
  'oracle_id_is_scryfall',
  'name',
  'flavor_name',
  'export_name',
  'set',
  'collector_number',
  'rarity',
  'layout',
  'image_status',
  'image',
  'rotated_image',
  'still_image',
  'mana_value',
  // 'type_line',
  'colors',
  'print_image_status',
  'print_image',
  'rotated_print_image',
  'still_print_image',
  'not_directly_draftable',
  'has_draft_partners',
  'legalities',
  'rulings',
  'finish',
  'border_color',
  'frame',
  'keywords',
  'creators',
  'artists',
  'artist_notes',
  'frame_effects',
  // 'tags',
  // 'tag_notes',
  // 'base_tags',
] as const satisfies rootPropType[];
const rootDeleteProps = [
  'id_is_scryfall',
  'oracle_id_is_scryfall',
  'flavor_name',
  'export_name',
  'rarity',
  'rotated_image',
  'still_image',
  'print_image_status',
  'print_image',
  'rotated_print_image',
  'still_print_image',
  'not_directly_draftable',
  'has_draft_partners',
  'keywords',
  'creators',
  'artists',
  'artist_notes',
  'frame_effects',
] as const satisfies rootPropType[];

/**
 * The record used to get the list of values for {@link rootChangeablePropType}
 */
export const rootChangeableProps = {
  add: rootAddProps,
  delete: rootDeleteProps,
} as const satisfies Record<changeType, rootPropType[]>;

/**
 * A union of all the props that are valid for a root change with a given change type
 */
export type rootChangeablePropType<T extends changeType> = (typeof rootChangeableProps)[T][number];

const rootArrayProps = [
  'keywords',
  'creators',
  'artists',
  'artist_notes',
  'frame_effects',
] as const;
type rootArrayPropLiteral = (typeof rootArrayProps)[number];
type rootArrayPropType<T extends changeType> = Extract<
  rootChangeablePropType<T>,
  rootArrayPropLiteral
>;
// type rootNonArrayPropType<T extends changeType> =  Exclude<rootChangeablePropType<T>,rootArrayPropLiteral>

/**
 * Whether a prop affects a list or record, meaning that 'add' pushes a value and 'delete' removes a value
 */
export const isRootArrayPropType = <T extends changeType>(
  prop: rootChangeablePropType<T>
): prop is rootArrayPropType<T> => rootArrayProps.includes(prop as any);
// export const isRootNonArrayPropType = <T extends changeType>(prop:rootChangeablePropType<T>):prop is rootNonArrayPropType<T> => !rootArrayProps.includes(prop as any)

/**
 * A change to a card root.
 */
export type rootChange<T extends changeType, K extends rootChangeablePropType<T>> = {
  /**
   * The location is the root.
   */
  location: 'root';
  /**
   * The type of change. Add is used for adding a new prop or completely overwriting an old one, or for pushing a value to a list or record; delete is for completely deleting a prop, or for removing a value from a list or record
   */
  change_type: T;
  /**
   * The prop to change. Must be valid for the given change type.
   */
  prop: K;
  /**
   * The value to change. Must be valid for the given prop. Must be omitted when using `change_type: 'delete'` and {@link isRootArrayPropType(prop)} is false
   */
  value?: rootElementValueType<K>;
};

type rootArrayChange<T extends changeType, K extends rootArrayPropType<T>> = rootChange<T, K>;
// type rootNonArrayChange<T extends changeType, K extends rootNonArrayPropType<T>> = rootChange<T,K>

/**
 * Whether a change's prop affects a list or record, meaning that 'add' pushes a value and 'delete' removes a value
 */
export const isRootArrayChange = <T extends changeType, K extends rootChangeablePropType<T>>(
  change: rootChange<T, K>
): change is rootArrayChange<T, K & rootArrayPropType<T>> => isRootArrayPropType(change.prop);
// export const isRootNonArrayChange = <T extends changeType, K extends rootChangeablePropType<T>>(change: rootChange<T, K>): change is rootNonArrayChange<T,K & rootNonArrayPropType<T>> => rootAddProps.includes(change.prop as any)

/**
 * Create a root change
 * @param change_type The type of change to use
 * @param prop The prop to change
 * @param value The value to change
 */
export const createRootChange = <T extends changeType, K extends rootChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value?: rootElementValueType<K>
): rootChange<T, K> => {
  const change: rootChange<T, K> = {
    location: 'root',
    change_type,
    prop,
  };
  if (value != undefined) {
    change.value = value;
  }
  return change;
};

const faceAddProps = [
  'name',
  'layout',
  'flavor_name',
  'export_name',
  'image_status',
  'image',
  'rotated_image',
  'still_image',
  'mana_cost',
  'mana_value',
  'supertypes',
  'types',
  'subtypes',
  // 'type_line',
  'oracle_text',
  'flavor_text',
  'power',
  'toughness',
  'loyalty',
  'defense',
  'hand_modifier',
  'life_modifier',
  'attraction_lights',
  'colors',
  'color_indicator',
  'finish',
  'watermark',
  'border_color',
  'frame',
  'compress_face',
  'drop_face',
  'frame_effects',
] as const satisfies facePropType[];
const faceDeleteProps = [
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
  'hand_modifier',
  'life_modifier',
  'attraction_lights',
  'color_indicator',
  'watermark',
  'frame',
  'compress_face',
  'drop_face',
  'frame_effects',
] as const satisfies facePropType[];

/**
 * The record used to get the list of values for {@link faceChangeablePropType}
 */
export const faceChangeableProps = {
  add: faceAddProps,
  delete: faceDeleteProps,
} as const satisfies Record<changeType, facePropType[]>;

/**
 * A union of all the props that are valid for a face change with a given change type
 */
export type faceChangeablePropType<T extends changeType> = (typeof faceChangeableProps)[T][number];

const faceArrayProps = ['frame_effects'] as const;
type faceArrayPropLiteral = (typeof faceArrayProps)[number];
type faceArrayPropType<T extends changeType> = Extract<
  faceChangeablePropType<T>,
  faceArrayPropLiteral
>;
// type faceNonArrayPropType<T extends changeType> =  Exclude<faceChangeablePropType<T>,faceArrayPropLiteral>

/**
 * Whether a prop affects a list or record, meaning that 'add' pushes a value and 'delete' removes a value
 */
export const isFaceArrayPropType = <T extends changeType>(
  prop: faceChangeablePropType<T>
): prop is faceArrayPropType<T> => faceArrayProps.includes(prop as any);
// export const isFaceNonArrayPropType = <T extends changeType>(prop:faceChangeablePropType<T>):prop is faceNonArrayPropType<T> => !faceArrayProps.includes(prop as any)

/**
 * A change to a card face.
 */
export type faceChange<T extends changeType, K extends faceChangeablePropType<T>> = {
  /**
   * The location is the face.
   */
  location: 'face';
  /**
   * The type of change. Add is used for adding a new prop or completely overwriting an old one, or for pushing a value to a list or record; delete is for completely deleting a prop, or for removing a value from a list or record
   */
  change_type: T;
  /**
   * The prop to change. Must be valid for the given change type.
   */
  prop: K;
  /**
   * The value to change. Must be valid for the given prop. Must be omitted when using `change_type: 'delete'` and {@link isRootArrayPropType(prop)} is false
   */
  value?: faceElementValueType<K>;
  /**
   * The face to change. If omitted, will default to `0`
   */
  index?: number;
};

type faceArrayChange<T extends changeType, K extends faceArrayPropType<T>> = faceChange<T, K>;
// type faceNonArrayChange<T extends changeType, K extends faceNonArrayPropType<T>> = faceChange<T,K>

/**
 * Whether a change's prop affects a list or record, meaning that 'add' pushes a value and 'delete' removes a value
 */
export const isFaceArrayChange = <T extends changeType, K extends faceChangeablePropType<T>>(
  change: faceChange<T, K>
): change is faceArrayChange<T, K & faceArrayPropType<T>> => isFaceArrayPropType(change.prop);
// export const isFaceNonArrayChange = <T extends changeType, K extends faceChangeablePropType<T>>(change: faceChange<T, K>): change is faceNonArrayChange<T,K & faceNonArrayPropType<T>> => faceAddProps.includes(change.prop as any)

/**
 * Create a face change
 * @param change_type The type of change to use
 * @param prop The prop to change
 * @param value The value to change
 * @param index The face to change
 */
export const createFaceChange = <T extends changeType, K extends faceChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value?: faceElementValueType<K>,
  index?: number
): faceChange<T, K> => {
  const change: faceChange<T, K> = {
    location: 'face',
    change_type,
    prop,
  };
  if (value != undefined) {
    change.value = value;
  }
  if (index != undefined) {
    change.index = index;
  }
  return change;
};

/**
 * A change to a card `card_faces` list.
 */
export type cardFacesChange = {
  /**
   * The location is `card_faces`.
   */
  location: 'card_faces';
  /**
   * The type of change. Add is used for adding a new face; delete is for deleting an existing face
   */
  change_type: changeType;
  /**
   * The index of the change. When adding a face, the new face will be inserted at this index.
   */
  index: number;
  /**
   * The face to change. When deleting a face, omit this.
   */
  face?: HCCardFace.MultiFaced;
};

/**
 * Create a card_faces change
 * @param change_type The type of change to use
 * @param index The index to change at
 * @param face The face to change (if adding)
 */
export const createCardFacesChange = (
  change_type: changeType,
  index: number,
  face?: HCCardFace.MultiFaced
): cardFacesChange => {
  const change: cardFacesChange = {
    location: 'card_faces',
    change_type,
    index,
  };
  if (face) {
    change.face = face;
  }
  return change;
};

/**
 * A change to a card `all_parts` list.
 */
export type allPartsChange = {
  /**
   * The location is `all_parts`.
   */
  location: 'all_parts';
  /**
   * The type of change. Add is used for adding a new related card or updating an existing one; delete is for deleting an existing related card
   */
  change_type: changeType;
  /**
   * The id of the change. Only use when `change_type: 'delete'`
   */
  id?: string;
  /**
   * The related card of the change. Only use when `change_type: 'add'`
   */
  related?: HCRelatedCard;
  /**
   * Set to true if blank fields in `related` shouldn't be added to the existing related card
   */
  no_blank?: boolean;
  /**
   * The prop of `related` to use to find the card to match, if `related.id` is blank
   */
  part_prop?: 'name' | 'hcid';
};

/**
 * Create an all_parts change
 * @param change_type The type of change to use
 * @param id The id to change at (if deleting)
 * @param related The related to change (if adding)
 * @param no_blank Whether to ignore blank fields in `related`
 * @param part_prop The prop of `related` to use to find the card to match, if `related.id` is blank
 */
export const createAllPartsChange = (
  change_type: changeType,
  id?: string,
  related?: HCRelatedCard,
  no_blank?: boolean,
  part_prop?: 'name' | 'hcid'
): allPartsChange => {
  const change: allPartsChange = {
    location: 'all_parts',
    change_type,
  };
  if (id != undefined) {
    change.id = id;
  }
  if (part_prop != undefined) {
    change.part_prop = part_prop;
  }
  if (related != undefined) {
    change.related = related;
  }
  if (no_blank != undefined) {
    change.no_blank = no_blank;
  }
  return change;
};

/**
 * A change to a tag
 */
export type tagChange = {
  /**
   * The location is tag.
   */
  location: 'tag';
  /**
   * The type of change. Add is used for adding a new tag or updating an existing one; delete is for deleting an existing tag
   */
  change_type: changeType;
  /**
   * The full tag to change.
   */
  full_tag: string;
  /**
   * The tag to change. Use this only when the full tag has a note value
   */
  tag?: string;
  /**
   * The note to change. Use this only if you actually want to add a note
   */
  note?: string;
};

/**
 * Create a tag change
 * @param change_type The full tag to change
 * @param tag The tag to change
 * @param note The note to change
 */
export const createTagChange = (
  change_type: changeType,
  full_tag: string,
  tag?: string,
  note?: string
): tagChange => {
  const change: tagChange = {
    location: 'tag',
    change_type,
    full_tag,
  };
  if (tag != undefined) {
    change.tag = tag;
  }
  if (note != undefined) {
    change.note = note;
  }
  return change;
};

/**
 * Any change
 */
export type anyChange =
  | rootChange<changeType, rootChangeablePropType<changeType>>
  | faceChange<changeType, faceChangeablePropType<changeType>>
  | cardFacesChange
  | allPartsChange
  | tagChange;

export const statusFilterList = ['pending', 'accepted', 'rejected', 'all'] as const;

export const changesetStatusList: ChangesetStatus[] = ['pending', 'accepted', 'rejected'];

export type StatusFilter = (typeof statusFilterList)[number];

export type ChangesetStatus = Exclude<StatusFilter, 'all'>;

export const isChangesetStatus = (value: any): value is ChangesetStatus =>
  changesetStatusList.includes(value as ChangesetStatus);
export const isStatusFilter = (value: any): value is StatusFilter =>
  statusFilterList.includes(value as StatusFilter);

export interface ChangesetUser {
  userId: string;
  username: string;
}
export type ChangesetDiffRow = {
  field: string;
  before: unknown;
  after: unknown;
};

export interface Changeset {
  id: string;
  cardId: string;
  status: ChangesetStatus;
  createdAt: Timestamp | string;
  resolvedAt: Timestamp | string | null;
  submittedBy: ChangesetUser;
  resolvedBy: ChangesetUser | null;
  changes: anyChange[];
  comment: string | null;
  rejectReason?: string | null;
  /** Populated by the API when listing changesets for review. */
  diff?: ChangesetDiffRow[];
}

const x = new Set();
