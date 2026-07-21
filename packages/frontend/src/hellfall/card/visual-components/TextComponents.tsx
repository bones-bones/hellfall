import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledSpan } from '../../../styling';

export const mediumLineStyles = createStyles({
  fontSize: '18px',
  fontWeight: 'normal',
  marginBlock: '.5rem',
});
export const MediumLine = createStyledSpan(mediumLineStyles, 'MediumLine');

export const mediumLineMarginStyles = createStyles(mediumLineStyles, { marginRight: '1em' });
export const MediumLineMargin = createStyledSpan(mediumLineMarginStyles, 'MediumLineMargin');

export const mediumTextStyles = createStyles(mediumLineStyles, { lineHeight: 1.125 });
export const MediumText = createStyledDiv(mediumTextStyles, 'MediumText');

export const mediumItalicsStyles = createStyles(mediumTextStyles, {
  fontStyle: 'italic',
});
export const MediumItalics = createStyledDiv(mediumItalicsStyles, 'MediumItalics');

export const flavorStyles = createStyles(mediumTextStyles, {
  fontFamily: '"MPlantin", Georgia, "Times New Roman", serif',
});
export const FlavorText = createStyledDiv(flavorStyles, 'FlavorText');

export const flavorItalicsStyles = createStyles(flavorStyles, mediumItalicsStyles);
export const FlavorItalics = createStyledDiv(flavorItalicsStyles, 'FlavorItalics');

export const mediumItalicLineStyles = createStyles(mediumLineStyles, {
  fontStyle: 'italic',
});
export const MediumItalicLine = createStyledSpan(mediumItalicLineStyles, 'MediumItalicLine');

export const smallTextStyles = createStyles({
  fontSize: '14px',
  fontWeight: 'normal',
  marginBlock: '.4rem',
});
export const SmallText = createStyledDiv(smallTextStyles, 'SmallText');
export const SmallLine = createStyledSpan(smallTextStyles, 'SmallLine');
