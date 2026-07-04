import {
  anyPropType,
  facePropType,
  partPropType,
  anyPropOrder,
  facePropOrder,
  partPropOrder,
} from '@hellfall/shared/types';

export const orderCardProps = (props: anyPropType[]) =>
  props.sort((a, b) => {
    if (!anyPropOrder.includes(a) || !anyPropOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return anyPropOrder.indexOf(a) - anyPropOrder.indexOf(b);
  });

export const orderFaceProps = (props: facePropType[]) =>
  props.sort((a, b) => {
    if (!facePropOrder.includes(a) || !facePropOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return facePropOrder.indexOf(a) - facePropOrder.indexOf(b);
  });

export const orderPartProps = (props: partPropType[]) =>
  props.sort((a, b) => {
    if (!partPropOrder.includes(a) || !partPropOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return partPropOrder.indexOf(a) - partPropOrder.indexOf(b);
  });
