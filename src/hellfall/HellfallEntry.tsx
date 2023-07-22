import styled from "@emotion/styled";

export const HellfallEntry = ({
  url,
  name,
  onClick,
}: {
  url: string;
  name: string;
  onClick: () => void;
}) => {
  return (
    <Container key={name} role="button">
      <span>{name}</span>
      <br></br>
      <StyledImage key={name} src={url} onClick={onClick} />
    </Container>
  );
};

const StyledImage = styled.img({
  width: "250px",
});

const Container = styled.div({
  width: "250px",
  display: "inline-block",
  padding: "5px",
  cursor: "pointer",
});
