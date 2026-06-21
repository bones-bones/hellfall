import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledHR } from '../../../styling';

const dividerStyles = createStyles({
  height: '2px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});
export const Divider = createStyledHR(dividerStyles);
