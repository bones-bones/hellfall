import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledHR } from '../../../styling';

const dividerStyles = createStyles({
  height: '2px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-24px',
  marginRight: '-24px',
});
export const Divider = createStyledHR(dividerStyles, 'Divider');

const separatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-24px',
  marginRight: '-24px',
});
export const Separator = createStyledHR(separatorStyles, 'Separator');
