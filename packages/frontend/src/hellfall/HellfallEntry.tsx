import styled from '@emotion/styled';
import { useState } from 'react';
import { VisuallyHiddenSpan } from './card/visual-components/VisuallyHiddenSpan';
import { StyledTitleLink } from './card/visual-components/StyledTitleLink';
import { TitleText } from './card/visual-components/TitleText';

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
    <Container key={id} role="button">
      {onClickTitle && (
        <StyledTitleLink
          key={id + '-title'}
          href={linkUrl}
          onClick={e => handleClick(e, onClickTitle as any)}
        >
          <TitleText as={imgLinkUrl ? 'h3' : 'span'} style={imgLinkUrl ? { lineHeight: 0 } : {}}>
            {name}
          </TitleText>
        </StyledTitleLink>
      )}
      <StyledImageLink
        href={imgLinkUrl ?? linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        imageLoaded={imageLoaded}
      >
        <StyledImage
          key={id + '-image'}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          style={
            imageLoaded || imageErrored
              ? {}
              : { visibility: 'hidden', display: 'inline', width: 0, height: 0, opacity: 0 }
          }
        />
        {!onClickTitle &&
          (imageLoaded ? (
            <VisuallyHiddenSpan key={id + '-name'}>{name}</VisuallyHiddenSpan>
          ) : (
            <TitleText
              /* onClick={e => handleClick(e)} */ key={id + '-name'}
              style={
                imageLoaded ? { visibility: 'hidden' } : { margin: '4px', position: 'absolute' }
              }
            >
              {name}
            </TitleText>
          ))}
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

const Container = styled.div({
  height: '340px',
  display: 'inline-block',
  padding: '5px',
  position: 'relative',
  '& img': {
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});

const StyledImageLink = styled.a<{ imageLoaded: boolean }>(
  {
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  props =>
    props.imageLoaded
      ? {}
      : {
          height: '340px',
          width: '243px',
          backgroundImage: 'repeating-linear-gradient(-55deg, #DDD, #DDD 5px, #CCC 5px, #CCC 10px)',
          borderRadius: '4.75% / 3.5%',
          position: 'relative',
        }
);

const StyledImage = styled.img({
  maxWidth: '500px',
  maxHeight: '340px',
  cursor: 'pointer',
});
