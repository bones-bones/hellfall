import { faceChangeableProps, faceChangeablePropType } from '@hellfall/shared/utils';

export function isFaceDeletable(key: string): key is faceChangeablePropType<'delete'> {
  return (faceChangeableProps.delete as readonly string[]).includes(key);
}
