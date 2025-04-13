import styled from "@emotion/styled";

export const HellfallEntry = ({
  url,
  name,
  onClick,
}: {
  url: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
}) => {
  return (
    <Container key={name} role="button">
      <span>{name}</span>
      <br />
      <StyledImage
        key={name}
        src={url}
        onClick={onClick}
        referrerPolicy="no-referrer"
      />
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
