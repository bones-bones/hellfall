import { HCCard, relatedComponent, HCRelatedCard } from '@hellfall/shared/types';
import { hasPartWithComp } from '@hellfall/shared/utils';
import { opAsBool, opToDont, opToNt, unescapeText } from '../utils';
import { stateFilterFunction, opType, summaryFunction } from '../types';

// const includeComponent = (part: HCRelatedCard) =>
//   ['token_maker', 'draft_partner'].includes(part.component);

type searchRelated = relatedComponent | 'persistent' | 'meld';
/**
 * The strings that can be converted to {@linkcode relatedComponent}`| 'persistent' | 'meld'`
 * and their conversions
 */
export const equivRelNames: Record<string, searchRelated> = {
  draftpartner: 'draft_partner',
  dp: 'draft_partner',
  dps: 'draft_partner',
  draftpartners: 'draft_partner',
  token: 'token',
  tokens: 'token',
  tokenmaker: 'token_maker',
  tm: 'token_maker',
  tms: 'token_maker',
  tokenmakers: 'token_maker',
  meldpart: 'meld_part',
  mp: 'meld_part',
  mps: 'meld_part',
  meldparts: 'meld_part',
  meldresult: 'meld_result',
  mr: 'meld_result',
  mrs: 'meld_result',
  meldresults: 'meld_result',
  meld: 'meld',
  persistent: 'persistent',
  persistents: 'persistent',
  persistenttoken: 'persistent',
  persistenttokens: 'persistent',
};
const toFullRelName = (text: string): searchRelated | undefined =>
  /* isComponent(text) ? text:  */ equivRelNames[unescapeText(text)];

// TODO: explain this better
/**
 * Checks to see if a card is an {@linkcode HCRelatedCard} that meets the given criterion (by
 * checking if it meets the inverse of that criterion as used in {@linkcode hasRelatedFilter})
 * @param value1 card to check
 * @param operator operator to use
 * @param value2 criterion from the search
 */
export const isRelatedFilter: stateFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string
) => {
  const comp = toFullRelName(value2);
  switch (comp) {
    case 'draft_partner':
      return opAsBool(hasPartWithComp(value1, comp) && value1.not_directly_draftable, operator);
    case 'token':
      return opAsBool(hasPartWithComp(value1, 'token_maker'), operator);
    case 'token_maker':
      return opAsBool(hasPartWithComp(value1, 'token'), operator);
    case 'meld_part':
      return opAsBool(hasPartWithComp(value1, 'meld_result'), operator);
    case 'meld_result':
      return opAsBool(
        hasPartWithComp(value1, 'meld_part') && !hasPartWithComp(value1, 'meld_result'),
        operator
      );
    case 'meld':
      return opAsBool(
        hasPartWithComp(value1, 'meld_part') || hasPartWithComp(value1, 'meld_result'),
        operator
      );
    case 'persistent':
      return opAsBool(
        value1.all_parts?.some(part => part.persistent) &&
          !value1.tags?.includes('persistent-tokens'),
        operator
      );
  }
};
/**
 * The summary for {@link isRelatedFilter}
 * @param operator the operator to use
 * @param value the criterion from the search
 */
export const isRelatedSummary: summaryFunction<string> = (operator: opType, value: string) => {
  const comp = toFullRelName(value);
  switch (comp) {
    case 'draft_partner':
      return `the cards are${opToNt(operator)} draftpartners`;
    case 'token':
      return `the cards are${opToNt(operator)} tokens`;
    case 'token_maker':
      return `the cards ${opToDont(operator)} make tokens`;
    case 'meld_part':
      return `the cards are${opToNt(operator)} parts of a meld`;
    case 'meld_result':
      return `the cards are${opToNt(operator)} the result of a meld`;
    case 'meld':
      return `the cards ${opToDont(operator)} meld`;
    case 'persistent':
      return `the cards ${opToDont(operator)} make persistent tokens`;
  }
  return `!Unknown related "${value}"`;
};
/**
 * Checks to see if a card has an {@linkcode HCRelatedCard} that meets the given criterion
 * @param value1 card to check
 * @param operator operator to use
 * @param value2 criterion from the search
 */
export const hasRelatedFilter: stateFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string
) => {
  const comp = toFullRelName(value2);
  switch (comp) {
    case 'draft_partner':
      return opAsBool(hasPartWithComp(value1, comp) && !value1.not_directly_draftable, operator);
    case 'token':
    case 'token_maker':
    case 'meld_result':
      return opAsBool(hasPartWithComp(value1, comp), operator);
    case 'meld_part':
      return opAsBool(
        hasPartWithComp(value1, comp) && !hasPartWithComp(value1, 'meld_result'),
        operator
      );
    case 'meld':
      return opAsBool(
        hasPartWithComp(value1, 'meld_part') || hasPartWithComp(value1, 'meld_result'),
        operator
      );
    case 'persistent':
      return opAsBool(
        value1.all_parts?.some(part => part.persistent) &&
          value1.tags?.includes('persistent-tokens'),
        operator
      );
  }
};
/**
 * The summary for {@link hasRelatedFilter}
 * @param operator the operator to use
 * @param value the criterion from the search
 */
export const hasRelatedSummary: summaryFunction<string> = (operator: opType, value: string) => {
  const comp = toFullRelName(value);
  switch (comp) {
    case 'draft_partner':
      return `the cards ${opToDont(operator)} have draftpartners`;
    case 'token':
      return `the cards ${opToDont(operator)} make tokens`;
    case 'token_maker':
      return `the cards are${opToNt(operator)} tokens`;
    case 'meld_part':
      return `the cards are${opToNt(operator)} the result of a meld`;
    case 'meld_result':
      return `the cards are${opToNt(operator)} parts of a meld`;
    case 'meld':
      return `the cards ${opToDont(operator)} meld`;
    case 'persistent':
      return `the cards are${opToNt(operator)} persistent tokens`;
  }
  return `!Unknown related "${value}"`;
};
