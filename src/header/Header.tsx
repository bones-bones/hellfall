import { Link } from "react-router-dom";
import { Heading } from "@workday/canvas-kit-react/text";
import { styled } from "@workday/canvas-kit-react/common";

export const Header = () => {
  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium"> {" > it's hellfall"}</StyledHeading>
        <Navigation>
          <Link to={"/"}>search</Link>, <Link to={"/draft"}>draft</Link>,{" "}
          <Link to={"/deck-builder"}>constructed</Link>,{" "}
          <Link to={"/hellscubes"}>cube</Link>
        </Navigation>
      </StyledHeader>
    </>
  );
};

const StyledHeading = styled(Heading)({
  marginTop: "0px",
  marginBottom: "5px",
});

const StyledHeader = styled("div")({
  backgroundColor: "#C690FF",
  borderBottom: "2px solid lightgray",
  marginTop: "0px",
});
const Navigation = styled("nav")();
