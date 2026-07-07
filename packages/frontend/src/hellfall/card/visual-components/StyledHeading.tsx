import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledHeading, createStyledHeadingLink } from '../../../styling';

const headingStyles = createStyles({
  marginTop: '0px',
  marginBottom: '10px',
});
export const StyledHeading = createStyledHeading(headingStyles, 'StyledHeading');
export const StyledHeadingLink = createStyledHeadingLink(headingStyles, 'StyledHeading');
