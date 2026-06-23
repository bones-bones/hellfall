import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledImg,
  createStenciledIntrinsic,
  createStenciledSpan,
  createStyledLink,
  createStyledSpan,
  htmlIntrinsicProps,
} from '../../styling';
import { LinkProps } from 'react-router-dom';
import { TextProps } from '@workday/canvas-kit-react';

// Text
const titleText = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
  position: 'relative',
  zIndex: 1,
};
const titleTextStyles = createStyles(titleText);
export const TitleText = createStyledSpan(titleTextStyles);

const clickableTitleStencil = createStencil({
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
interface ClickableTitleProps extends TextProps {
  hasURL?: boolean;
  as?: string;
}
export const ClickableTitle = createStenciledSpan<ClickableTitleProps>(clickableTitleStencil);
interface ClickableTitleH3Props extends htmlIntrinsicProps {
  hasURL?: boolean;
  as?: string;
}
export const ClickableTitleH3 = createStenciledIntrinsic<ClickableTitleH3Props>(
  'h3',
  clickableTitleStencil
);

const titleLinkStyles = createStyles({
  display: 'inline-block',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'pre-wrap',
});
export const StyledTitleLink = createStyledLink(titleLinkStyles);

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
const visuallyHiddenStyles = createStyles(visuallyHidden);
export const VisuallyHiddenSpan = createStyledSpan(visuallyHiddenStyles);

const titleStencil = createStencil({
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
interface LoadedTitleProps extends TextProps {
  imageLoaded?: boolean;
}
export const LoadedTitle = createStenciledSpan<LoadedTitleProps>(titleStencil);

export const sharedContainerStyles = createStyles({
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
  overflow: 'hidden',
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
interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  isRelated?: boolean;
  hideImage?: boolean;
}
export const StyledImage = createStenciledImg<ImageProps>(imageStencil);

export interface ImageLinkProps extends LinkProps {
  imageLoaded?: boolean;
}
