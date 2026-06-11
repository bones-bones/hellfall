import type { HCCardFace, HCRelatedCard } from '@hellfall/shared/types';
import type { facePropType, faceValueType, rootPropType, rootValueType } from '../cardHandling';
import { Timestamp } from '@google-cloud/firestore';

export type changeType = 'add' | 'push' | 'delete' | 'pop';

export type changeLocation = 'root' | 'face' | 'card_faces' | 'all_parts' | 'tag';

export type rootChange<K extends rootPropType> = {
  location: 'root';
  change_type: changeType;
  prop: K;
  value?: rootValueType<K>;
};

export const createRootChange = <K extends rootPropType>(
  change_type: changeType,
  prop: K,
  value?: rootValueType<K>
): rootChange<K> => {
  const change: rootChange<K> = {
    location: 'root',
    change_type,
    prop,
  };
  if (value != undefined) {
    change.value = value;
  }
  return change;
};

export type faceChange<K extends facePropType> = {
  location: 'face';
  change_type: changeType;
  prop: K;
  value?: faceValueType<K>;
  index?: number;
};

export const createFaceChange = <K extends facePropType>(
  change_type: changeType,
  prop: K,
  value?: faceValueType<K>,
  index?: number
): faceChange<K> => {
  const change: faceChange<K> = {
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

export type cardFacesChange = {
  location: 'card_faces';
  change_type: 'add' | 'delete';
  index: number;
  face?: HCCardFace.MultiFaced;
};

export const createCardFacesChange = (
  change_type: 'add' | 'delete',
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

export type allPartsChange = {
  location: 'all_parts';
  change_type: 'add' | 'delete';
  id?: string;
  part_prop?: 'name' | 'hcid';
  related?: HCRelatedCard;
  no_overwrite?: boolean;
};

export const createAllPartsChange = (
  change_type: 'add' | 'delete',
  index: number,
  id?: string,
  part_prop?: 'name' | 'hcid',
  related?: HCRelatedCard,
  no_overwrite?: boolean
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
  if (no_overwrite != undefined) {
    change.no_overwrite = no_overwrite;
  }
  return change;
};

export type tagChange = {
  location: 'tag';
  change_type: 'add' | 'delete';
  full_tag: string;
  tag?: string;
  note?: string;
};

export const createTagChange = (
  change_type: 'add' | 'delete',
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

export type anyChange =
  | rootChange<rootPropType>
  | faceChange<facePropType>
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
}
