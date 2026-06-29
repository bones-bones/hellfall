import type {
  faceElementValueType,
  facePropType,
  HCCardFace,
  HCRelatedCard,
  rootElementValueType,
  rootPropType,
} from '@hellfall/shared/types';
import { Timestamp } from '@google-cloud/firestore';

const changeTypeList = ['add', 'push', 'delete', 'pop'] as const;
/**
 * The type of change. Add is used for adding a new prop or completely overwriting an old one; push is for pushing a value to a list or record; delete is for completely deleting a prop; and pop is for removing a value from a list or record
 */
export type changeType = (typeof changeTypeList)[number];
export const isChangeType = (value: any): value is changeType => changeTypeList.includes(value);

export type noListChangeType = Exclude<changeType, 'push' | 'pop'>;
const noList = ['add', 'delete'];
export const isNoListChangeType = (value: any): value is noListChangeType => noList.includes(value);

/**
 * The location of the change.
 */
export type changeLocation = 'root' | 'face' | 'card_faces' | 'all_parts' | 'tag';

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
] as const satisfies rootPropType[];
const rootPushProps = [
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
] as const satisfies rootPropType[];
const rootPopProps = [
  'keywords',
  'creators',
  'artists',
  'artist_notes',
  'frame_effects',
  // 'tags',
  // 'tag_notes',
  // 'base_tags',
] as const satisfies rootPropType[];

/**
 * The record used to get the list of values for {@link rootChangeablePropType}
 */
export const rootChangeableProps = {
  add: rootAddProps,
  push: rootPushProps,
  delete: rootDeleteProps,
  pop: rootPopProps,
} as const satisfies Record<changeType, rootPropType[]>;

/**
 * A union of all the props that are valid for a root change with a given change type
 */
export type rootChangeablePropType<T extends changeType> = (typeof rootChangeableProps)[T][number];
/**
 * A change to a card root.
 */
export type rootChange<T extends changeType, K extends rootChangeablePropType<T>> = {
  /**
   * The location is the root.
   */
  location: 'root';
  /**
   * The type of change. Add is used for adding a new prop or completely overwriting an old one; push is for pushing a value to a list or record; delete is for completely deleting a prop; and pop is for removing a value from a list or record
   */
  change_type: T;
  /**
   * The prop to change. Must be valid for the given change type.
   */
  prop: K;
  /**
   * The value to change. Must be valid for the given prop. Must be omitted when using `change_type: 'delete'`
   */
  value?: rootElementValueType<K>;
};

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
] as const satisfies facePropType[];
const facePushProps = ['frame_effects'] as const satisfies facePropType[];
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
] as const satisfies facePropType[];
const facePopProps = ['frame_effects'] as const satisfies facePropType[];

/**
 * The record used to get the list of values for {@link faceChangeablePropType}
 */
export const faceChangeableProps = {
  add: faceAddProps,
  push: facePushProps,
  delete: faceDeleteProps,
  pop: facePopProps,
} as const satisfies Record<changeType, facePropType[]>;

/**
 * A union of all the props that are valid for a face change with a given change type
 */
export type faceChangeablePropType<T extends changeType> = (typeof faceChangeableProps)[T][number];

/**
 * A change to a card face.
 */
export type faceChange<T extends changeType, K extends faceChangeablePropType<T>> = {
  /**
   * The location is the face.
   */
  location: 'face';
  /**
   * The type of change. Add is used for adding a new prop or completely overwriting an old one; push is for pushing a value to a list or record; delete is for completely deleting a prop; and pop is for removing a value from a list or record
   */
  change_type: T;
  /**
   * The prop to change. Must be valid for the given change type.
   */
  prop: K;
  /**
   * The value to change. Must be valid for the given prop. Must be omitted when using `change_type: 'delete'`
   */
  value?: faceElementValueType<K>;
  /**
   * The face to change. If omitted, will default to `0`
   */
  index?: number;
};

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
  change_type: noListChangeType;
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
  change_type: noListChangeType,
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
  change_type: noListChangeType;
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
  change_type: noListChangeType,
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
  change_type: noListChangeType;
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
  change_type: noListChangeType,
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
