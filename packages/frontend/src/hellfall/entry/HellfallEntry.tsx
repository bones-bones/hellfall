import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { useState } from 'react';
import {
  linkStyles,
  loadedStyles,
  sharedContainerStyles,
  ImageLinkProps,
  StyledTitleLink,
  ClickableTitle,
  ClickableTitleH3,
  StyledImage,
  LoadedTitle,
  VisuallyHiddenSpan,
} from './entryStyles';
import { createStenciledLink, createStyledDiv } from '../../styling';

export const HellfallEntry = ({
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

const containerStyles = createStyles(sharedContainerStyles, {
  height: '340px',
  display: 'inline-block',
  position: 'relative',
});
const Container = createStyledDiv(containerStyles);

const imageLinkStencil = createStencil({
  vars: {},
  base: linkStyles,
  modifiers: {
    imageLoaded: {
      false: {
        ...loadedStyles,
        height: '340px',
        width: '243px',
        display: 'block',
      },
    },
  },
});
const StyledImageLink = createStenciledLink<ImageLinkProps>(imageLinkStencil);
