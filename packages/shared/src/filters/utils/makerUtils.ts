import {
  anyPropOrder,
  anyPropType,
  HCCard,
  isAnyPropType,
  isFacePropType,
  isRootPropType,
} from '@hellfall/shared/types';
import {
  ensureArray,
  getAllNames,
  getFromAll,
  getFromFaces,
  getSet,
  toFaces,
  toNumber,
} from '@hellfall/shared/utils';
import { unescapeText } from './parseUtils';
import { numSearch } from '../types';
import { fixValue } from './filterUtils';

const otherPropList = ['showcase', 'settype', 'pt'] as const;
type otherPropType = (typeof otherPropList)[number];
/**
 * Any prop of type {@linkcode anyPropType} or {@linkcode otherPropType}
 */
export type queryPropType = anyPropType | otherPropType;
export const isQueryPropType = (value: any): value is queryPropType =>
  isAnyPropType(value) || otherPropList.includes(value);
const earlyProps = ['name', ...otherPropList];
/**
 * Gets the values from a prop
 * @param T type of the prop
 * @param card card to get the values from
 * @param prop prop to get the values of
 * @param location location on the card to get the values from
 */
export const getValuesFromProp = <T extends queryPropType>(
  card: HCCard.Any,
  prop: T,
  location: 'any' | 'face' | 'root' = 'any'
): numSearch[] => {
  const values: numSearch[] = [];
  if (earlyProps.includes(prop)) {
    switch (prop) {
      case 'name':
        values.push(...getAllNames(card));
        break;
      case 'showcase':
        values.push(...(card.tag_notes?.['showcase-frame']?.split(', ') ?? []));
        break;
      case 'settype':
        values.push(...ensureArray(getSet(card.set)?.set_type));
        break;
      case 'pt':
        values.push(
          ...toFaces(card).flatMap(e =>
            !e.power && !e.toughness ? [] : (toNumber(e.power) ?? 0) + (toNumber(e.toughness) ?? 0)
          )
        );
        break;
    }
    return fixValue(values);
  }
  if (prop == 'name') {
    return getAllNames(card).map(value => unescapeText(value));
  }
  if (prop == 'showcase') {
    return (card.tag_notes?.['showcase-frame']?.split(', ') ?? []).map(v => unescapeText(v));
  }
  if (prop == 'settype') {
    return ensureArray(getSet(card.set)?.set_type);
  }
  if (isFacePropType(prop) && location != 'root') {
    switch (prop) {
      case 'supertypes':
      case 'types':
      case 'subtypes':
        values.push(
          ...toFaces(card).flatMap(e => (e[prop] && e[prop]?.length > 1 ? e[prop].join(' ') : []))
        );
        break;
      case 'type_line':
        values.push(...getFromFaces(card, 'supertypes'));
        values.push(...getFromFaces(card, 'types'));
        values.push(...getFromFaces(card, 'subtypes'));
        break;
    }
    values.push(
      ...((isRootPropType(prop) && location != 'face' ? getFromAll : (getFromFaces as any))(
        card,
        prop
      ) as numSearch[])
    );
  } else if (isRootPropType(prop) && location != 'face') {
    const value = card[prop];
    if (typeof value == 'object' && !Array.isArray(value) && value !== null) {
      values.push(...Object.values(value));
    } else {
      values.push(...ensureArray<numSearch>(card[prop] as numSearch | numSearch[]));
    }
  }
  return fixValue(values);
};
type queryValueType = { props: queryPropType[]; location: 'any' | 'face' | 'root' };
const queryNamePropRecord: Record<string, queryPropType | queryPropType[]> = {
  mana: 'mana_cost',
  type: 'type_line',
  cardtype: 'types',
  oracle: 'oracle_text',
  flavor: 'flavor_text',
  lore: ['name', 'type_line', 'oracle_text', 'flavor_text'],
  border: 'border_color',
  cardframe: 'frame',
  frame: ['frame', 'frame_effects'],
  anylayout: 'layout',
  facelayout: 'layout',
  block: 'set',
  group: 'set',
  in: ['set', 'settype'],
  number: 'collector_number',
};
const queryNameLocationRecord: Record<string, 'face' | 'root'> = {
  layout: 'root',
  facelayout: 'face',
  manavalue: 'root',
};
export const queryNameToSummary = (queryName: string): string => {
  const queryProp = queryNamePropRecord[queryName];
  if (queryProp && !Array.isArray(queryProp)) {
    return queryProp.replaceAll('_', ' ');
  }
  if (isAnyPropType(queryName)) {
    return queryName;
  }
  return (
    anyPropOrder
      .find(prop => [queryName, `${queryName}s`].includes(prop.replaceAll('_', '')))
      ?.replaceAll('_', ' ') ?? queryName
  );
};
/**
 * Gets the props and location from a query name
 * @param queryName query name to get the props and location form
 * @returns an object of {@linkcode queryValueType}
 */
export const queryNameToValue = (queryName: string): queryValueType => {
  const queryValue: queryValueType = {
    props: [],
    location: 'any',
  };
  const queryProp = queryNamePropRecord[queryName];
  if (queryProp) {
    queryValue.props = ensureArray(queryProp);
  }
  if (isAnyPropType(queryName) && !queryValue.props.length) {
    queryValue.props = [queryName];
  }
  if (!queryValue.props.length) {
    const name =
      anyPropOrder.find(prop => [queryName, `${queryName}s`].includes(prop.replaceAll('_', ''))) ??
      (queryName as anyPropType);
    queryValue.props = ensureArray(name);
  }
  if (queryName in queryNameLocationRecord) {
    queryValue.location = queryNameLocationRecord[queryName];
  }
  return queryValue;
};
