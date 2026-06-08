import styled from '@emotion/styled';
import { MouseEventHandler, useState } from 'react';
import { VisuallyHiddenSpan } from './card/VisuallyHiddenSpan';
import { StyledTitleLink } from './card/StyledTitleLink';
import { TitleText } from './card/TitleText';

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
    <RelatedContainer key={id} role="button">
      {onClickTitle && (
        <StyledTitleLink
          key={id + '-title'}
          href={linkUrl}
          onClick={e => handleClick(e, onClickTitle as any)}
        >
          <TitleText>{name}</TitleText>
        </StyledTitleLink>
      )}
      <RelatedStyledImageLink
        href={linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        imageLoaded={imageLoaded}
      >
        <RelatedStyledImage
          key={id}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          title={plainText ?? name}
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
      </RelatedStyledImageLink>
    </RelatedContainer>
  );
};

const RelatedContainer = styled.div({
  display: 'flex',
  overflow: 'auto',
  maxheight: '500px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px',
  '& img': {
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});

const RelatedStyledImageLink = styled.a<{ imageLoaded: boolean }>(
  {
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  props =>
    props.imageLoaded
      ? {}
      : {
          height: '320px',
          width: '230px',
          backgroundImage: 'repeating-linear-gradient(-55deg, #DDD, #DDD 5px, #CCC 5px, #CCC 10px)',
          borderRadius: '4.75% / 3.5%',
          position: 'relative',
        }
);

const RelatedStyledImage = styled.img({
  maxHeight: '450px',
  maxWidth: '320px',
  cursor: 'pointer',
});
