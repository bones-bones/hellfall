import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { toDeck } from "../deck-builder/toDeck";
import { cardsAtom } from "../hellfall/cardsAtom";
import { toCockCube } from "./toCockCube";
import { useAtomValue } from "jotai";
import { HCEntry } from "../types";
import { PropsWithChildren } from "react";

export const CubeResources = () => {
  const cards = useAtomValue(cardsAtom);

  return (
    <Container>
      <h2>This page contains resources to help you play the cubes</h2>

      <CubeResource
        key={"HLC"}
        cubeId={"HLC"}
        cards={cards}
        tts={{
          url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3009290113",
          title: "TTS Plugin by Benana",
        }}
      >
        <StyledLink to="one">Rules and quick links for weird cards</StyledLink>
      </CubeResource>

      <CubeResource key={"HC2"} cubeId={"HC2"} cards={cards}></CubeResource>

      <CubeResource
        key={"HC3"}
        cubeId={"HC3"}
        cards={cards}
        tts={{
          url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3309357076",
          title: "TTS Plugin by Benana",
        }}
      ></CubeResource>

      <CubeResource key={"HC4"} cubeId={"HC4"} cards={cards}></CubeResource>

      <CubeResource
        key={"HCV"}
        cubeId={"HC5"}
        cards={new Array(720).fill({
          "Card Type(s)": ["◻︎◻︎◻︎◻︎◻︎", "", "", ""],
          Name: "◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎",
          Image:
            "https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/G/l/i/iGlik/images.png",
          CMC: 0,
          Creator: "◻︎◻︎◻︎◻︎",
          Set: "HC5",
          Rulings: "",
          Cost: ["", "", "", ""],
          Loyalty: ["", null, "", ""],
          "small alt image": "",
          FIELD44: "",
          FIELD45: "",
          FIELD46: "",
          FIELD47: "",
          FIELD48: "",
          FIELD49: "",
          FIELD50: "",
          FIELD51: "",
          FIELD52: "",
          FIELD53: "",
          FIELD54: "",
          FIELD55: "",
          FIELD56: "",
        })}
      ></CubeResource>

      <CubeResource key={"HCV"} cubeId={"HCV"} cards={cards}></CubeResource>

      <CubeResource key={"HC6"} cubeId={"HC6"} cards={cards}></CubeResource>

      <CubeResource key={"HCP"} cubeId={"HCP"} cards={cards}></CubeResource>
    </Container>
  );
};

const StyledLink = styled(Link)({
  // textDecoration: "none",
  //color: "black",
});
const Container = styled.div({ padding: "10px" });

const CubeResource: React.FC<
  PropsWithChildren<{
    cubeId: string;
    cards: HCEntry[];
    tts?: { url: string; title: string };
    cubeResourceLink?: string;
  }>
> = ({ cards, cubeId, tts, cubeResourceLink, children }) => {
  const parsedCubeId =
    cubeId.replace("HC", "") === "HLC" ? 1 : parseInt(cubeId.replace("HC", ""));
  return (
    <div>
      <h3>{cubeId}</h3>
      {children}
      <br />
      {cubeResourceLink && (
        <StyledLink to={cubeResourceLink}>Specific cards</StyledLink>
      )}
      {tts ? (
        <Link to={tts.url}>{tts.title}</Link>
      ) : (
        <button
          onClick={() => {
            const filtered = cards.filter((e) => e.Set === cubeId);

            const val = toDeck(filtered);
            const url =
              "data:text/plain;base64," +
              btoa(unescape(encodeURIComponent(JSON.stringify(val))));
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            // the filename you want
            a.download = `Hellscube ${parsedCubeId}.json`;
            document.body.appendChild(a);
            a.click();
          }}
        >
          Download {cubeId} cube for TTS
        </button>
      )}
      <button
        onClick={() => {
          const val = toCockCube({
            set: cubeId,
            name: "Hellscube " + parsedCubeId,
            cards: cards.filter((e) => e.Set === cubeId),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube " + parsedCubeId + ".xml";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download {cubeId} cube for Cockatrice
      </button>
    </div>
  );
};
