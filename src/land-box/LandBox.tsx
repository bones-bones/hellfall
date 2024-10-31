import styled from "@emotion/styled";
import { useLands } from "./useLands";
import { Land } from "./types";
import { useState } from "react";

export const LandBox = () => {
  const lands = useLands();
  const [active, setActive] = useState<undefined | Land>();
  const [activeSet, setActiveSet] = useState("HC4");

  const grouped = lands
    .filter((e) => e.Set === activeSet)
    .reduce<Record<Land["Type"], Land[]>>((curr, next) => {
      if (curr[next.Type]) {
        curr[next.Type] = [...curr[next.Type], next];
      } else {
        curr[next.Type] = [next];
      }

      return curr;
    }, {} as any);

  return (
    <>
      <h1>Need some lands? grab some from the land box</h1>
      <div>
        set:{" "}
        <select
          defaultValue={activeSet}
          onChange={(e) => {
            setActiveSet(e.target.value);
          }}
        >
          <option>HC4</option>
          <option>Old</option>
        </select>
      </div>
      {active && (
        <BigView clear={() => setActive(undefined)} land={active}></BigView>
      )}
      <Container>
        {Object.entries(grouped)
          .sort((a, b) => {
            let aVal = 0;
            let bVal = 0;
            if (a[0].includes("Snow")) {
              aVal += 10;
            }
            if (b[0].includes("Snow")) {
              bVal += 10;
            }
            const alphaSort = a[0] > b[0] ? 1 : -1;

            return aVal + alphaSort > bVal ? 1 : -1;
          })
          .map(([type, values], j) => {
            return (
              <CardsContainer key={j}>
                <StyledH2>{type}</StyledH2>

                {values
                  .sort((a, b) => {
                    if (getRarityNumber(a.Rarity) < getRarityNumber(b.Rarity)) {
                      return 1;
                    }
                    return -1;
                  })
                  .map((entry, i) => {
                    return (
                      <LandImageContainer
                        land={entry}
                        key={i}
                        onClick={() => {
                          setActive(entry);
                        }}
                      />
                    );
                  })}
              </CardsContainer>
            );
          })}
      </Container>
    </>
  );
};
const StyledH2 = styled.h2({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Container = styled.div({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
});
const CardsContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  padding: "2px",
});

const getRarityNumber = (val: string) => {
  switch (val) {
    case "Mythic":
      return 3;
    case "Rare":
      return 2;
    case "Uncommon":
      return 1;
    default:
      return 0;
  }
};

const BigView = ({ land, clear }: { land: Land; clear: any }) => {
  return (
    <BigViewContianer onClick={clear}>
      <StyledHImage key={land.Url} src={land.Url} />
      <CardFooter {...{ type: "subtitle" }} rarity={land["Rarity"] as any}>
        Set: {land.Set} Creator: {land.Creator}
      </CardFooter>
    </BigViewContianer>
  );
};

const BigViewContianer = styled.div({
  ':hover > [type="subtitle"]': { display: "flex" },
  position: "fixed",
  display: "flex",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  zIndex: 5,
  top: "0px",
});

const LandImageContainer = ({
  land,
  onClick,
}: {
  land: Land;
  onClick: any;
}) => {
  return (
    <ImageContainer onClick={onClick}>
      <StyledImage key={land.Url} src={land.Url} />
      <CardFooter {...{ type: "subtitle" }} rarity={land["Rarity"] as any}>
        Set: {land.Set} Creator: {land.Creator}
      </CardFooter>
    </ImageContainer>
  );
};

const CardFooter = styled.div(
  ({ rarity }: { rarity?: "Mythic" | "Rare" | "Uncommon" }) => {
    let backgroundColor = "black";
    let borderColor = "white";
    let color = "white";

    if (rarity == "Mythic") {
      backgroundColor = "#f59326";
      borderColor = "#b43326";
      color = "black";
    }
    if (rarity == "Rare") {
      backgroundColor = "#e9d292";
      borderColor = "#887441";
      color = "black";
    }
    if (rarity == "Uncommon") {
      backgroundColor = "#bae2ef";
      borderColor = "#4b6c79";
      color = "black";
    }

    return {
      width: "100%",
      backgroundColor,
      border: `4px solid ${borderColor}`,
      boxSizing: "border-box",
      color,
      borderRadius: "5px",
      minHeight: "30px",
      position: "absolute",
      bottom: "0px",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
    };
  }
);

const StyledImage = styled("img")({ width: "100%" });
const StyledHImage = styled("img")({ height: "100%" });

const ImageContainer = styled.div({
  height: "400px",
  width: "287px",
  position: "relative",
  ':hover > [type="subtitle"]': { display: "flex" },
});
