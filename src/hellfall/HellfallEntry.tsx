import styled from '@emotion/styled';

export const HellfallEntry = ({
  url,
  id,
  name,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <Container key={id} role="button">
      <span key={id} onClick={onClickTitle} style={{ whiteSpace: 'pre-wrap' }}>
        {name}
      </span>
      <br />
      <StyledImage key={id} src={url} onClick={onClick} referrerPolicy="no-referrer" />
    </Container>
  );
};

const StyledImage = styled.img({
  maxWidth: '250px',
  maxHeight: '340px',
});

const Container = styled.div({
  width: '250px',

  display: 'inline-block',
  padding: '5px',
  cursor: 'pointer',
});

export const HellfallRelatedEntry = ({
  url,
  id,
  name,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <RelatedContainer key={id} role="button">
      <span key={id} onClick={onClickTitle} style={{ whiteSpace: 'pre-wrap', fontSize:'1.25rem'}}>
        {name}
      </span>
      <br />
      <RelatedStyledImage key={id} src={url} onClick={onClick} referrerPolicy="no-referrer" />
    </RelatedContainer>
  );
};
const RelatedStyledImage = styled.img({
  height: '500px',
});

const RelatedContainer = styled.div({
  // width: '250px',
  height:'500px',
  display: 'inline-block',
  padding: '5px',
  cursor: 'pointer',
});
