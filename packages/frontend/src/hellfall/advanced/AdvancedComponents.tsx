import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledLabel, createStyledLegend } from '../../styling';

const labelStyles = createStyles({ fontWeight: 'bold' });
export const StyledLabel = createStyledLabel(labelStyles);

const legendStyles = createStyles({ fontWeight: 'bold' });
export const StyledLegend = createStyledLegend(legendStyles);

const componentHolderStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '10px',
});
export const StyledComponentHolder = createStyledDiv(componentHolderStyles);
