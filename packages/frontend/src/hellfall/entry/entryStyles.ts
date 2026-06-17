import { createStencil, createStyles } from '@workday/canvas-kit-styling';

// Text
const titleText = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
  position: 'relative',
  zIndex: 1,
};

export const clickableTitleStencil = createStencil({
  vars: {},
  base: titleText,
  modifiers: {
    hasURL: {
      true: {
        lineHeight: 0,
      },
    },
  },
});

// Link
export const titleLinkStyles = createStyles({
  display: 'inline-block',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'pre-wrap',
});
// Text
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
  pointerEvents: 'none',
};
export const visuallyHiddenSpan = createStyles(visuallyHidden);

export const titleStencil = createStencil({
  vars: {},
  base: titleText,
  modifiers: {
    imageLoaded: {
      true: visuallyHidden,
      false: {
        // margin: '4px',
        position: 'absolute',
        top: '4px',
        left: '4px',
        margin: 0,
        zIndex: 1,
      },
    },
  },
});

export const sharedContainer = createStyles({
  margin: '5px',
  '& img': {
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});

export const linkStyles = {
  display: 'block',
  textDecoration: 'none',
  cursor: 'pointer',
};

export const loadedStyles = {
  backgroundImage: 'repeating-linear-gradient(-55deg, #DDD, #DDD 5px, #CCC 5px, #CCC 10px)',
  borderRadius: '4.75% / 3.5%',
  position: 'relative',
};

export const imageStencil = createStencil({
  vars: {},
  base: {
    maxWidth: '500px',
    maxHeight: '340px',
    cursor: 'pointer',
  },
  modifiers: {
    isRelated: {
      true: {
        maxHeight: '450px',
        maxWidth: '320px',
      },
    },
    hideImage: {
      true: {
        visibility: 'hidden',
        display: 'inline',
        width: 0,
        height: 0,
        opacity: 0,
      },
    },
  },
});
