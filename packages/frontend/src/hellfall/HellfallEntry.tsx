import styled from '@emotion/styled';
import { withBasePath } from '../basePath.ts';

export const HellfallEntry = ({
  url,
  id,
  name,
  otherNames,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLImageElement>;
}) => {
  const linkUrl = withBasePath(`/card/${encodeURIComponent(id)}`);

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
      {onClickTitle ? (
        <>
          <StyledTitleLink
            key={id + '-title'}
            href={linkUrl}
            onClick={e => handleClick(e, onClickTitle as any)}
          >
            <TitleText>{name}</TitleText>
          </StyledTitleLink>
          <br />
        </>
      ) : (
        <>
          <VisuallyHiddenSpan key={id}>{name}</VisuallyHiddenSpan>
          {otherNames ? (
            otherNames.map((otherName, i) => {
              return (
                <VisuallyHiddenSpan key={'other-name-' + i + '-' + id}>
                  {otherName}
                </VisuallyHiddenSpan>
              );
            })
          ) : (
            <></>
          )}
        </>
      )}
      <StyledImageLink href={linkUrl} onClick={e => handleClick(e)}>
        <StyledImage key={id} src={url} referrerPolicy="no-referrer" aria-label={name} />
      </StyledImageLink>
    </Container>
  );
};

const StyledImage = styled.img({
  maxWidth: '500px',
  maxHeight: '340px',
  cursor: 'pointer',
});

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

const StyledImageLink = styled.a({
  display: 'block',
  textDecoration: 'none',
  cursor: 'pointer',
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

export const HellfallRelatedEntry = ({
  url,
  id,
  name,
  otherNames,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLImageElement>;
}) => {
  const linkUrl = withBasePath(`/card/${encodeURIComponent(id)}`);

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
      {onClickTitle ? (
        <>
          <StyledTitleLink
            key={id + '-title'}
            href={linkUrl}
            onClick={e => handleClick(e, onClickTitle as any)}
          >
            <TitleText>{name}</TitleText>
          </StyledTitleLink>
          <br />
        </>
      ) : (
        <>
          <VisuallyHiddenSpan key={id}>{name}</VisuallyHiddenSpan>
          {otherNames ? (
            otherNames.map((otherName, i) => {
              return (
                <VisuallyHiddenSpan key={'other-name-' + i + '-' + id}>
                  {otherName}
                </VisuallyHiddenSpan>
              );
            })
          ) : (
            <></>
          )}
        </>
      )}
      <RelatedStyledImageLink href={linkUrl} onClick={e => handleClick(e)}>
        <RelatedStyledImage key={id} src={url} referrerPolicy="no-referrer" aria-label={name} />
      </RelatedStyledImageLink>
    </RelatedContainer>
  );
};
const RelatedStyledImage = styled.img({
  maxHeight: '450px',
  maxWidth: '320px',
  cursor: 'pointer',
});

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

const RelatedStyledImageLink = styled.a({
  display: 'block',
  textDecoration: 'none',
  cursor: 'pointer',
});
