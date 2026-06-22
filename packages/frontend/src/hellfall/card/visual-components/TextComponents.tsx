import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledSpan } from '../../../styling';
import { type } from '@workday/canvas-kit-react';

export const mediumLineStyles = createStyles({
  fontSize: '18px',
  fontWeight: 'normal',
  marginBlock: '.5rem',
});
export const MediumLine = createStyledSpan(mediumLineStyles);

export const mediumLineMarginStyles = createStyles(mediumLineStyles, { marginRight: '1em' });
export const MediumLineMargin = createStyledSpan(mediumLineMarginStyles);

export const mediumTextStyles = createStyles(mediumLineStyles, { lineHeight: 1.125 });
export const MediumText = createStyledDiv(mediumTextStyles);

export const mediumItalicsStyles = createStyles(mediumTextStyles, {
  fontStyle: 'italic',
  fontFamily: '"MPlantin", Georgia, "Times New Roman", serif',
});
export const MediumItalics = createStyledDiv(mediumItalicsStyles);

export const mediumItalicLineStyles = createStyles(mediumLineStyles, {
  fontStyle: 'italic',
  fontFamily: '"MPlantin", Georgia, "Times New Roman", serif',
});
export const MediumItalicLine = createStyledSpan(mediumItalicLineStyles);

export const smallTextStyles = createStyles({
  fontSize: '14px',
  fontWeight: 'normal',
  marginBlock: '.4rem',
});
export const SmallText = createStyledDiv(smallTextStyles);
export const SmallLine = createStyledSpan(smallTextStyles);
