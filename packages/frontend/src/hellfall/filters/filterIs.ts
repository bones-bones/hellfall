import { HCCard } from '@hellfall/shared/types';
import { funcOp, cardStringFilter, looseOpType, opType, getActualOp, opToNot, opIsNegative, opToDont } from './types';
import { canBeACommander } from '../canBeACommander';
import {
  filterCardLayout,
  filterFaceLayout,
  toCardLayout,
  toFaceLayout,
} from './values/filterLayout';
import { filterCardFrame, filterFrame, filterFrameEffect } from './values/filterFrame';

const cardFramesToParse = ['old', 'new'];
const frameEffectsToParse = [
  'full',
  'fullart',
  'extended',
  'extendedart',
  'vertical',
  'verticalart',
  'showcase',
  'etched',
];

export const filterIs: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    const resolveIs = (criteria: string) => {
      if (cardFramesToParse.includes(value2)) {
        return filterCardFrame(value1, actualOp, value2);
      }
      if (frameEffectsToParse.includes(value2)) {
        return filterFrameEffect(value1, actualOp, value2);
      }
      if (value2 in toCardLayout) {
        return filterCardLayout(value1, actualOp, value2);
      }
      switch (criteria) {
        case 'foil':
          return value1.finish == 'foil';
        case 'nonfoil':
          return value1.finish == 'nonfoil';
        case 'commander':
          return canBeACommander(value1);
      }
      return false;
    };
    return funcOp(actualOp, resolveIs, value2);
  },
  { defaultOp: '=' as opType, toSummary: (value:string,op:looseOpType) => {
    const actualOp = getActualOp(filterIs, op);
    if (cardFramesToParse.includes(value)) {
      return filterCardFrame.toSummary(value, actualOp);
    }
    if (frameEffectsToParse.includes(value)) {
      return filterFrameEffect.toSummary(value, actualOp);
    }
    if (value in toCardLayout) {
      return filterCardLayout.toSummary(value, actualOp);
    }
    switch (value) {
      case 'foil':
        return `the card is ${opToNot(actualOp)} foil`;
      case 'nonfoil':
        return `the card is ${opToNot(actualOp)} nonfoil`;
      case 'commander':
        return `the card can${opIsNegative(actualOp)?"'t":''} be your commander`;
    }
    return '!';}}
);
export const filterHas: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    const resolveHas = (criteria: string) => {
      if (cardFramesToParse.includes(value2)) {
        return filterCardFrame(value1, actualOp, value2);
      }
      if (frameEffectsToParse.includes(value2)) {
        return filterFrameEffect(value1, actualOp, value2);
      }
      if (value2 in toFaceLayout) {
        return filterFaceLayout(value1, actualOp, value2);
      }
      switch (criteria) {
        case 'foil':
          return value1.finish == 'foil';
        case 'nonfoil':
          return value1.finish == 'nonfoil';
        case 'indicator':
          return Boolean(value1.toFaces().find(face => face.color_indicator));
        case 'frameeffect':
          return value1.toFaces().some(face => face.frame_effects) || Boolean(value1.frame_effects);
        case 'frameeffects':
          return value1.toFaces().some(face => face.frame_effects) || Boolean(value1.frame_effects);
      }
      return false;
    };
    return funcOp(actualOp, resolveHas, value2);
  },
  { defaultOp: '=' as opType, toSummary: (value:string,op:looseOpType) => {
    const actualOp = getActualOp(filterIs, op);
    if (cardFramesToParse.includes(value)) {
      return filterCardFrame.toSummary(value, actualOp);
    }
    if (frameEffectsToParse.includes(value)) {
      return filterFrameEffect.toSummary(value, actualOp);
    }
    if (value in toCardLayout) {
      return filterCardLayout.toSummary(value, actualOp);
    }
    switch (value) {
      case 'foil':
        return `the card is ${opToNot(actualOp)} foil`;
      case 'nonfoil':
        return `the card is ${opToNot(actualOp)} nonfoil`;
      case 'indicator':
        return `the cards ${opToDont} have a color indicator`;
      case 'frameeffect':
        return `the cards ${opToDont} have a frame effect`;
      case 'frameeffects':
        return `the cards ${opToDont} have a frame effect`;
    }
    return '!';}}
);
