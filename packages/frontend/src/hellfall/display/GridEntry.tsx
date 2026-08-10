import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { useState } from 'react';
import {
  createStenciledImg,
  createStenciledIntrinsic,
  createStenciledLink,
  createStenciledSpan,
  createStyledDiv,
  createStyledLink,
  createStyledSpan,
  htmlIntrinsicProps,
} from '../../styling';
import { TextProps } from '@workday/canvas-kit-react';
import { LinkProps } from 'react-router-dom';

export const GridEntry = ({
  url,
  id,
  name,
  otherNames,
  plainText,
  onClick,
  onClickTitle,
  imgLinkUrl,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  plainText?: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLImageElement>;
  imgLinkUrl?: string;
}) => {
  const linkUrl = `/card/${encodeURIComponent(id)}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);

  const handleClick = (
    e: React.MouseEvent,
    customHandler?: React.MouseEventHandler<HTMLImageElement>
  ) => {
    if (e.button === 1 || e.metaKey || e.ctrlKey) {
      // Let the link handle it naturally
      return;
    }
    e.preventDefault();
    if (customHandler) {
      customHandler(e as any);
    } else {
      onClick(e as any);
    }
  };

  return (
    <Container key={id}>
      {onClickTitle && (
        <StyledTitleLink
          key={id + '-title'}
          to={linkUrl}
          onClick={e => handleClick(e, onClickTitle as any)}
        >
          {imgLinkUrl ? (
            <ClickableTitleH3 hasURL={!!imgLinkUrl}>{name}</ClickableTitleH3>
          ) : (
            <ClickableTitle hasURL={!!imgLinkUrl}>{name}</ClickableTitle>
          )}
        </StyledTitleLink>
      )}
      <StyledImageLink
        to={imgLinkUrl ?? linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        imageLoaded={imageLoaded}
      >
        <StyledImage
          key={id + '-image'}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          title={plainText ?? name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          hideImage={!(imageLoaded || imageErrored)}
        />
        {!onClickTitle && (
          <LoadedTitle imageLoaded={imageLoaded} key={id + '-name'}>
            {name}
          </LoadedTitle>
        )}
        {otherNames &&
          otherNames.map((otherName, i) => {
            return (
              <VisuallyHiddenSpan key={'other-name-' + i + '-' + id}>
                {otherName}
              </VisuallyHiddenSpan>
            );
          })}
      </StyledImageLink>
    </Container>
  );
};
const titleText = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
  position: 'relative',
  zIndex: 1,
};
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
export const ClickableTitle = createStenciledSpan<ClickableTitleProps>(
  clickableTitleStencil,
  'ClickableTitle'
);
interface ClickableTitleH3Props extends htmlIntrinsicProps {
  hasURL?: boolean;
  as?: string;
}
export const ClickableTitleH3 = createStenciledIntrinsic<ClickableTitleH3Props>(
  'h3',
  clickableTitleStencil
);

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
const VisuallyHiddenSpan = createStyledSpan(visuallyHiddenStyles, 'VisuallyHiddenSpan');

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
const LoadedTitle = createStenciledSpan<LoadedTitleProps>(titleStencil, 'LoadedTitle');

const titleLinkStyles = createStyles({
  display: 'inline-block',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'pre-wrap',
});
const StyledTitleLink = createStyledLink(titleLinkStyles, 'StyledTitleLink');

const imageStencil = createStencil({
  vars: {},
  base: {
    maxWidth: '500px',
    maxHeight: '340px',
    cursor: 'pointer',
  },
  modifiers: {
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
  hideImage?: boolean;
}
const StyledImage = createStenciledImg<ImageProps>(imageStencil, 'StyledImage');

export interface ImageLinkProps extends LinkProps {
  imageLoaded?: boolean;
}

const containerStyles = createStyles({
  margin: '5px',
  '& img': {
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
  height: '340px',
  display: 'inline-block',
  position: 'relative',
});
const Container = createStyledDiv(containerStyles, 'Container');

const imageLinkStencil = createStencil({
  vars: {},
  base: {
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  modifiers: {
    imageLoaded: {
      false: {
        backgroundImage: 'repeating-linear-gradient(-55deg, #DDD, #DDD 5px, #CCC 5px, #CCC 10px)',
        borderRadius: '4.75% / 3.5%',
        position: 'relative',
        overflow: 'hidden',
        height: '340px',
        width: '243px',
        display: 'block',
      },
    },
  },
});
const StyledImageLink = createStenciledLink<ImageLinkProps>(imageLinkStencil, 'StyledImageLink');
