import styled from '@emotion/styled';

export const HellfallEntry = ({
  url,
  id,
  name,
  onClick,
}: // onClickTitle,
{
  url: string;
  id: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  // onClickTitle?: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <Container key={id} role="button">
      <VisuallyHiddenSpan key={id} /** onClick={onClickTitle}*/>{name}</VisuallyHiddenSpan>
      <StyledImage
        key={id}
        src={url}
        onClick={onClick}
        referrerPolicy="no-referrer"
        aria-label={name}
      />
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
  // maxWidth:'500px',
  display: 'inline-block',
  padding: '5px',
  position: 'relative',
  '& img': {
    // maxHeight: '100%',
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
});
export const HellfallRelatedEntry = ({
  url,
  id,
  name,
  onClick,
}: // onClickTitle,
{
  url: string;
  id: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  // onClickTitle?: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <RelatedContainer key={id} role="button">
      <VisuallyHiddenSpan key={id} /** onClick={onClickTitle}*/>{name}</VisuallyHiddenSpan>
      <RelatedStyledImage
        key={id}
        src={url}
        onClick={onClick}
        referrerPolicy="no-referrer"
        aria-label={name}
      />
    </RelatedContainer>
  );
};
const RelatedStyledImage = styled.img({
  // height: '500px',
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
    // maxHeight: '100%',
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});
