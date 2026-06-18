import { MouseEventHandler, useState } from 'react';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  linkStyles,
  loadedStyles,
  sharedContainerStyles,
  ImageLinkProps,
  StyledTitleLink,
  ClickableTitle,
  StyledImage,
  LoadedTitle,
  VisuallyHiddenSpan,
} from './entryStyles';
import { createStenciledLink, createStyledDiv } from '../../styling/StyledElements';

export const HellfallRelatedEntry = ({
  url,
  id,
  name,
  otherNames,
  plainText,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  plainText?: string;
  onClick: MouseEventHandler<HTMLImageElement>;
  onClickTitle?: MouseEventHandler<HTMLImageElement>;
}) => {
  const linkUrl = `/card/${encodeURIComponent(id)}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);

  const handleClick = (
    e: React.MouseEvent,
    customHandler?: MouseEventHandler<HTMLImageElement>
  ) => {
    if (e.button === 1 || e.metaKey || e.ctrlKey) {
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
          <ClickableTitle>{name}</ClickableTitle>
        </StyledTitleLink>
      )}
      <StyledImageLink
        to={linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        imageLoaded={imageLoaded}
      >
        <StyledImage
          key={id}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          title={plainText ?? name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          hideImage={!(imageLoaded || imageErrored)}
          isRelated={true}
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
  display: 'flex',
  overflow: 'auto',
  maxheight: '500px',
  alignItems: 'center',
  justifyContent: 'center',
});
const Container = createStyledDiv(containerStyles);

const imageLinkStencil = createStencil({
  vars: {},
  base: linkStyles,
  modifiers: {
    imageLoaded: {
      false: {
        height: '450px',
        width: '320px',
        ...loadedStyles,
      },
    },
  },
});
const StyledImageLink = createStenciledLink<ImageLinkProps>(imageLinkStencil);
