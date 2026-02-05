import styled from "@emotion/styled";

export const HellfallEntry = ({
  url,
  id,
  name,
  onClick,
}: {
  url: string;
  id: string;
  name: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
}) => {
  return (
    <Container key={id} role="button">
      <span>{name}</span>
      <br />
      <StyledImage
        key={id}
        src={url}
        onClick={onClick}
        referrerPolicy="no-referrer"
      />
    </Container>
  );
};

const StyledImage = styled.img({
  maxWidth: "250px",
  maxHeight: "340px",
});

const Container = styled.div({
  width: "250px",

  display: "inline-block",
  padding: "5px",
  cursor: "pointer",
});
