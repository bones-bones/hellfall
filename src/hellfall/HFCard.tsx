import { Card } from "@workday/canvas-kit-react/card";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { Heading, Text } from "@workday/canvas-kit-react/text";
import { SetLegality } from "./SetLegality";
import { stringToMana } from "./stringToMana";

import { Link } from "react-router-dom";
export const HFCard = ({ data }: { data: HCEntry }) => {
  // wow what a weird ts bug
  const sideCount =
    // @ts-ignore
    data["Card Type(s)"]?.findLastIndex(
      (entry: any) => entry !== null && entry != ""
    ) + 1 || 0;

  return (
    <Container key={data["Name"]}>
      <ImageContainer key="image-container">
        <img src={data["Image"]} height="500px" referrerPolicy="no-referrer" />
      </ImageContainer>
      <Card>
        <Card.Body padding={"zero"}>
          <StyledHeading size="large">{data["Name"]} </StyledHeading>

          {new Array(sideCount).fill("").map((_, i) => (
            <div key={"side-" + (i + 1)}>
              {i > 0 && <Divider />}
              <Text typeLevel="body.medium" key="cost">
                {stringToMana(data.Cost?.[i] || "")}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="type">
                {`${((data["Supertype(s)"] || [])[i] ?? "").replaceAll(
                  ";",
                  " "
                )} ${(data["Card Type(s)"]?.[i] || "").replaceAll(";", " ")}${
                  data["Subtype(s)"]?.[i]
                    ? " — " + data["Subtype(s)"][i]?.replaceAll(";", " ")
                    : ""
                }`}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="rules">
                {(data["Text Box"]?.[i] || "").split("\\n").map((entry) => {
                  return (
                    <>
                      {entry
                        .split(/(?=[()]+)/)
                        .filter((chunk) => chunk != ")")
                        .map((chunk, ci) => {
                          if (chunk.startsWith("(")) {
                            return (
                              <ItalicText key={ci}>
                                {stringToMana(chunk)})
                              </ItalicText>
                            );
                          }
                          return stringToMana(chunk);
                        })}
                      <br />
                    </>
                  );
                })}
              </Text>
              <br />
              {data["Flavor Text"] && data["Flavor Text"][i] !== null && (
                <>
                  <ItalicText typeLevel="body.medium" key="flavor">
                    {renderText((data["Flavor Text"]?.[i] || "").split("\\n"))}
                  </ItalicText>
                  <br />
                </>
              )}
              {data["power"]?.[i] &&
                data["power"][i]!.toString() !== "" &&
                data["power"] != null && (
                  <>
                    <Text typeLevel="body.medium" key="stats">
                      {data["power"][i]}/{data["toughness"]![i]}
                    </Text>
                    <br />
                  </>
                )}
            </div>
          ))}
          {data["Set"] && (
            <>
              <Divider />
              <Text typeLevel="body.medium">Set: {data["Set"]}</Text>
              <br />
            </>
          )}
          {data["Creator"] && (
            <>
              <Text key="creator">Creator: {data["Creator"]}</Text>
              <br />
            </>
          )}
          {
            <>
              <SetLegality banned={data["Constructed"] == "Banned"} />
              <br />
            </>
          }
          {data["Rulings"] != "" && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Rulings</StyledHeading>
                {data["Rulings"]}
              </div>
            </>
          )}
          {data.Tags && data.Tags !== "" && (
            <>
              <Text key="Tags">
                Tags:{" "}
                {data["Tags"].split(";").map((tagEntry) => (
                  <Link key={tagEntry} to={"?tags=" + tagEntry} target="_blank">
                    {tagEntry}
                  </Link>
                ))}
              </Text>
              <br />
            </>
          )}
          {data["tokens"] && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Related Tokens</StyledHeading>
                {data["tokens"].map((entry) => (
                  <img key={entry.Name} src={entry.Image} height="500px" />
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

const renderText = (text: string[]) => {
  return text.map((entry) => {
    return (
      <>
        {stringToMana(entry)}
        <br />
      </>
    );
  });
};

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  fontSize: "16px",
  justifyContent: "center",
});

const ItalicText = styled(Text)({ fontStyle: "italic" });

const ImageContainer = styled.div({
  overflowX: "auto",
  width: "fit-content",
});
const StyledHeading = styled(Heading)({
  marginTop: "0px",
  marginBottom: "10px",
});
const Divider = styled.div({
  height: "1px",
  backgroundColor: "grey",
  marginTop: "10px",
  marginBottom: "10px",
});
