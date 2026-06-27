import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledSubtext } from '../styling';

const errorTextStyles = createStyles({
  color: '#c00',
});
export const ErrorText = createStyledSubtext(errorTextStyles, 'ErrorText');
