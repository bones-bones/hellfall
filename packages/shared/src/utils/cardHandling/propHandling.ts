import { HCCard } from '@hellfall/shared/types';
import {
  anyEntriesType,
  faceEntriesType,
  faceMappedType,
  facePropType,
  partEntriesType,
  partMappedType,
  rootEntriesType,
  rootMappedType,
  rootPropType,
} from './propTypes';
import { firestoreCard } from '../firestore';

export const getRootEntries = (record: rootMappedType) => Object.entries(record) as rootEntriesType;

export const getFaceEntries = (record: faceMappedType) => Object.entries(record) as faceEntriesType;

export const getPartEntries = (record: partMappedType) => Object.entries(record) as partEntriesType;

export const getCardEntries = (card: HCCard.Any) => Object.entries(card) as anyEntriesType;

export const getFireEntries = (card: firestoreCard) => Object.entries(card) as anyEntriesType;

export const getCardFaceEntries = (card: HCCard.AnyMultiFaced, index?: number) =>
  Object.entries(card.card_faces[index ?? 0]) as faceEntriesType;

export const getFilteredRootEntries = (card: HCCard.Any, propList: rootPropType[]) =>
  (Object.entries(card) as rootEntriesType).filter(([key, value]) => propList.includes(key));

export const getFilteredFaceEntries = (
  card: HCCard.Any,
  propList: facePropType[],
  index?: number
) =>
  (
    Object.entries('card_faces' in card ? card.card_faces[index ?? 0] : card) as faceEntriesType
  ).filter(([key, value]) => propList.includes(key));

export const getFilteredRootProps = (card: HCCard.Any, propList: rootPropType[]) =>
  (Object.keys(card) as rootPropType[]).filter(key => propList.includes(key));
export const getFilteredFaceProps = (card: HCCard.Any, propList: facePropType[], index?: number) =>
  (Object.keys('card_faces' in card ? card.card_faces[index ?? 0] : card) as facePropType[]).filter(
    key => propList.includes(key)
  );
