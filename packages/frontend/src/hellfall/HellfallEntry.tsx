import styled from '@emotion/styled';
import { useState } from 'react';

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

interface ImageProps {
  imageLoaded: boolean;
}

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

const StyledTitleLink = styled.a({
  display: 'inline-block',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'pre-wrap',
});

const TitleText = styled.span({
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const StyledImageLink = styled.a<ImageProps>(
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

const VisuallyHiddenSpan = styled.span({
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
});

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
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLImageElement>;
}) => {
  const linkUrl = `/card/${encodeURIComponent(id)}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);

  const handleClick = (
    e: React.MouseEvent,
    customHandler?: React.MouseEventHandler<HTMLImageElement>
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

const RelatedStyledImageLink = styled.a<ImageProps>(
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
