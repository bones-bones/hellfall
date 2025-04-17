import styled from "@emotion/styled";

export const Watchwolfwar = () => {
  return (
    <PageContainer>
      <StyleComponent>
        <Title>
          Welcome to the WatchWolfWar, the place to be to determine the
          Hellsiest card of All!
        </Title>
      </StyleComponent>
      <StyleComponent>
        <Subtitle>
          Brought to you by goldcrackle, with odes of help from llllll.
        </Subtitle>
      </StyleComponent>
      <CardContainer>
        <CardReceptaclePlaceThing>Clock</CardReceptaclePlaceThing>
        <CardReceptaclePlaceThing>Wolf</CardReceptaclePlaceThing>
      </CardContainer>
      <StyleComponent>
        <ResultsReceptaclePlaceThing>
          Blah blah blah blah blah blah blah blah blah blah blah blah blah blah
          blah blah blah.
        </ResultsReceptaclePlaceThing>
      </StyleComponent>
    </PageContainer>
  );
};

const PageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f9f9f9",
  minHeight: "100vh",
});
const Title = styled("h1")({ textAlign: "center", marginBottom: "10px" });
const Subtitle = styled("h3")({ textAlign: "center", marginBottom: "30px" });
const CardContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  gap: "40px",
  marginBottom: "30px",
  width: "100%",
  maxWidth: "800px",
});
const CardReceptaclePlaceThing = styled("div")({
  width: "400px",
  height: "400px",
  backgroundColor: "#eee",
  border: "2px dashed #999",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2em",
  cursor: "pointer",
  transition: "border 0.3s",
  "&:hover": {
    border: "2px solid purple",
  },
});
const ResultsReceptaclePlaceThing = styled("div")({
  width: "100%",
  maxWidth: "600px",
  padding: "20px",
  backgroundColor: "grey",
  border: "1px solid #ccc",
  boxShadow: "0 2px 8px rgba(168, 45, 45, 1)",
  textAlign: "center",
});

const StyleComponent = styled("div")({ color: "purple", display: "flex" });