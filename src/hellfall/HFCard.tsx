import { Card } from "@workday/canvas-kit-react/card";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { Heading, Text } from "@workday/canvas-kit-react/text";
import {
  StatusIndicator,
  StatusIndicatorType,
} from "@workday/canvas-kit-react/status-indicator";
import { colorToSvgMapping } from "./colorToSvgMapping";
const manaMatchRegex = /({[WUBRGTCP0123456Y7X/Pickle]+})/; // /({[WUBRGTCP01234567X(2/W)]})/;
export const HFCard = ({ data }: { data: HCEntry }) => {
  // wow what a weird ts bug
  const sideCount =
    (data["Card Type(s)"] as any).findLastIndex(
      (entry: string) => entry != ""
    ) + 1;

  return (
    <Container key={data["Name"]}>
      <ImageContainer key="image-container">
        <img src={data["Image"]} height="500px" />
      </ImageContainer>
      <Card>
        <Card.Body padding={"zero"}>
          <StyledHeading size="large">{data["Name"]} </StyledHeading>

          {new Array(sideCount).fill("").map((_, i) => {
            return (
              <div key={"side-" + (i + 1)}>
                {i > 0 && <Divider />}
                <Text typeLevel="body.medium" key="cost">
                  {data.Cost[i].split(manaMatchRegex).map((entry) => {
                    if (entry.startsWith("{") && entry.endsWith("}")) {
                      const icon = colorToSvgMapping(
                        entry.replaceAll(/[{}]/g, "")
                      );
                      return icon ? (
                        <ManaContainer>
                          <ManaSymbol src={icon} />
                        </ManaContainer>
                      ) : (
                        entry
                      );
                    }

                    return entry;
                  })}
                </Text>
                <br></br>
                <Text typeLevel="body.medium" key="type">
                  {`${data["Supertype(s)"][i]} ${data["Card Type(s)"][
                    i
                  ].replaceAll(";", " ")}${
                    data["Subtype(s)"][i]
                      ? " — " + data["Subtype(s)"][i]?.replaceAll(";", " ")
                      : ""
                  }`}
                </Text>
                <br />
                <Text typeLevel="body.medium" key="rules">
                  {data["Text Box"][i].split("\\n").map((entry) => {
                    return (
                      <>
                        {entry
                          .split(/(?=[()]+)/)
                          .filter((chunk) => {
                            return chunk != ")";
                          })
                          .map((chunk, ci) => {
                            if (chunk.startsWith("(")) {
                              return (
                                <ItalicText key={ci}>
                                  {chunk.split(manaMatchRegex).map((entry) => {
                                    if (
                                      entry.startsWith("{") &&
                                      entry.endsWith("}")
                                    ) {
                                      const icon = colorToSvgMapping(
                                        entry.replaceAll(/[{}]/g, "")
                                      );

                                      return icon ? (
                                        <ManaContainer>
                                          <ManaSymbol src={icon} />
                                        </ManaContainer>
                                      ) : (
                                        entry
                                      );
                                    }

                                    return entry;
                                  })}
                                  )
                                </ItalicText>
                              );
                            }
                            return chunk.split(manaMatchRegex).map((entry) => {
                              if (
                                entry.startsWith("{") &&
                                entry.endsWith("}")
                              ) {
                                const icon = colorToSvgMapping(
                                  entry.replaceAll(/[{}]/g, "")
                                );

                                return icon ? (
                                  <ManaContainer>
                                    <ManaSymbol src={icon} />
                                  </ManaContainer>
                                ) : (
                                  entry
                                );
                              }

                              return entry;
                            });
                          })}
                        <br />
                      </>
                    );
                  })}
                </Text>
                <br />
                {data["Flavor Text"][i] && (
                  <>
                    <ItalicText typeLevel="body.medium" key="flavor">
                      {data["Flavor Text"][i].split("\\n").map((entry) => {
                        return (
                          <>
                            {entry
                              .split(/({[WUBRGTCP01234567X]})/)
                              .map((entry) => {
                                if (
                                  entry.startsWith("{") &&
                                  entry.endsWith("}")
                                ) {
                                  const icon = colorToSvgMapping(
                                    entry.replaceAll(/[{}]/g, "")
                                  );

                                  return icon ? (
                                    <ManaContainer>
                                      <ManaSymbol src={icon} />
                                    </ManaContainer>
                                  ) : (
                                    entry
                                  );
                                }

                                return entry;
                              })}
                            <br />
                          </>
                        );
                      })}
                    </ItalicText>
                    <br />
                  </>
                )}
                {data["power"][i] != null && (
                  <>
                    <Text typeLevel="body.medium" key="stats">
                      {data["power"][i]}/{data["toughness"][i]}
                    </Text>
                    <br />
                  </>
                )}
              </div>
            );
          })}
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
              {data["Constructed"] == "Banned" ? (
                <StatusIndicator
                  label={"Banned"}
                  type={StatusIndicatorType.Red}
                />
              ) : (
                <StatusIndicator
                  label={"Legal"}
                  type={StatusIndicatorType.Green}
                />
              )}
              <br />
            </>
          }
          {data["Rulings"] != "" && (
            <>
              <Divider></Divider>
              <div>
                <StyledHeading size="small">Rulings</StyledHeading>
                {data["Rulings"]}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

const ManaSymbol = styled("img")({ height: "16px" });

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  fontSize: "16px",
});

const ManaContainer = styled("div")({
  display: "inline-flex",
  height: "1.75rem",
  verticalAlign: "-webkit-baseline-middle",
});
const ItalicText = styled(Text)({ fontStyle: "italic" });

const ImageContainer = styled.div({ overflowX: "auto" });
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
