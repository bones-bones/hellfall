import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { toDeck } from "../deck-builder/toDeck";
import { cardsAtom } from "../hellfall/cardsAtom";
import { toCockCube } from "./toCockCube";
import { useAtomValue } from "jotai";
import { HCEntry } from "../types";
import { PropsWithChildren } from "react";
import { toDraftmancerCube } from "./toDraftmancer";

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
        description={"A refined version of the cube that started it all"}
      >
        <StyledLink to="one">Rules and quick links for weird cards</StyledLink>
      </CubeResource>

      <CubeResource
        key={"HC2"}
        cubeId={"HC2"}
        cards={cards}
        description="The second cube, trades purple for clear archetypes."
      ></CubeResource>

      <CubeResource
        key={"HC3"}
        cubeId={"HC3"}
        cards={cards}
        tts={{
          url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3309357076",
          title: "TTS Plugin by Benana",
        }}
        description="At least it's not HC2"
      ></CubeResource>

      <CubeResource
        key={"HC4"}
        cubeId={"HC4"}
        cards={cards}
        description="A Vintage power cube. A rip-roaring good time."
      ></CubeResource>

      <CubeResource
        key={"HC5"}
        cubeId={"HC5"}
        cards={getHc5()}
        description="L̵̨̡̧͎̩̘͓̩̬̂̈́́͒͌̔̽̈̌͗̏̈́͘͠͝Ợ̷̛̼̐͆͌̈́̑͗̆͑́̈́̓̀̚͠͝S̸̺̲͕̺̫͉̣̿̈ͅT̸̘̖͇͍͍̫̝̑͑̇̀͋̉̎̑͊͝ͅ"
      ></CubeResource>

      <CubeResource
        key={"HCV"}
        cubeId={"HCV"}
        cards={cards}
        description="Here's where vetoed, slotsed, and seasonal cards go"
      ></CubeResource>

      <CubeResource
        key={"HC6"}
        cubeId={"HC6"}
        cards={cards}
        description="The Commander Cube"
      ></CubeResource>

      <CubeResource
        key={"HCC"}
        cubeId={"HCC"}
        cards={cards}
        description="Cards that are relevant for constructed, but not in any cube"
      ></CubeResource>

      <CubeResource
        key={"HCP"}
        cubeId={"HCP"}
        cards={cards}
        description="HELLSCUBE PLANECHASE"
      ></CubeResource>

      <CubeResource
        key={"HC7.0"}
        cubeId={"HC7.0"}
        cards={cards}
        description="The 7th cube, purple abounds"
      ></CubeResource>
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
    description: string;
  }>
> = ({ cards, cubeId, tts, cubeResourceLink, children, description }) => {
  const parsedCubeId =
    cubeId.replace("HC", "") === "HLC"
      ? 1
      : cubeId == "HCP" || cubeId == "HCV" || cubeId == "HCC"
      ? cubeId
      : parseInt(cubeId.replace("HC", ""));
  return (
    <div>
      <h3>{cubeId}</h3>
      <div>{description}</div>
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
      )}{" "}
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
      </button>{" "}
      <button
        onClick={() => {
          const val = toDraftmancerCube({
            set: cubeId,

            cards: cards.filter((e) => e.Set === cubeId),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube " + parsedCubeId + " (Draftmancer).txt";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download {cubeId} cube for Draftmancer
      </button>
    </div>
  );
};

const getHc5 = () =>
  new Array(720).fill({
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
  });
