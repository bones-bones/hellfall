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

export type faceChange<K extends facePropType> = {
  location: 'face';
  change_type: changeType;
  prop: K;
  value?: faceValueType<K>;
  index?: number;
};

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
  tag: string;
};

export type anyChange =
  | rootChange<rootPropType>
  | faceChange<facePropType>
  | cardFacesChange
  | allPartsChange
  | tagChange;
