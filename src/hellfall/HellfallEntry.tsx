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
    <Container role="button">
      <span onClick={onClickTitle}>
        {name}
      </span>
      <br />
      <StyledImage src={url} onClick={onClick} referrerPolicy="no-referrer" />
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
