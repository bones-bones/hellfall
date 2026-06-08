import type { HCCardFace, HCRelatedCard } from '@hellfall/shared/types';
import type { facePropType, faceValueType, rootPropType, rootValueType } from '../cardHandling';

export type changeType = 'add' | 'push' | 'delete' | 'pop';

export type changeLocation = 'root' | 'face' | 'card_faces' | 'all_parts' | 'tag';

export type rootChange<K extends rootPropType> = {
  location: 'root';
  change_type: changeType;
  prop: K;
  value?: rootValueType<K>;
};

export const createRootChange = <K extends rootPropType>(change_type: changeType,prop: K,value?: rootValueType<K>):rootChange<K> => {
  const change:rootChange<K> = {
    location: 'root',
    change_type,
    prop
  }
  if (value != undefined) {
    change.value = value;
  }
  return change
}

export type faceChange<K extends facePropType> = {
  location: 'face';
  change_type: changeType;
  prop: K;
  value?: faceValueType<K>;
  index?: number;
};

export const createFaceChange = <K extends facePropType>(change_type: changeType, prop: K,value?: faceValueType<K>, ):faceChange<K> => {
  const change:faceChange<K> = {
    location: 'face',
    change_type,
    prop
  }
  if (value != undefined) {
    change.value = value;
  }
  if (index != undefined) {
    change.index = index;
  }
  return change
}


export type cardFacesChange = {
  location: 'card_faces';
  index: number;
  change_type: 'add' | 'delete';
  face?: HCCardFace.MultiFaced;
};

export type allPartsChange = {
  location: 'all_parts';
  change_type: 'add' | 'delete';
  id?: string;
  part_prop?: 'name' | 'hcid';
  related?: HCRelatedCard;
  no_overwrite?: boolean;
};

export type tagChange = {
  location: 'tag';
  change_type: 'add' | 'delete';
  full_tag: string;
  tag?: string;
  note?: string;
  // rederive_props: boolean;
};

export type anyChange =
  | rootChange<rootPropType>
  | faceChange<facePropType>
  | cardFacesChange
  | allPartsChange
  | tagChange;
