import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { toDeck } from "../deck-builder/toDeck";
import { cardsAtom } from "../hellfall/cardsAtom";
import { toCockCube } from "./toCockCube";
import { useAtomValue } from "jotai";
import { HCEntry } from "../types";
import { ReactNode } from "react";
import { toDraftmancerCube } from "./toDraftmancer";
import { getHc5 } from "./getHc5";

type CubeSetup = {
  name: string;
  id: string;
  description: string;
  cards: HCEntry[];
  quickLink?: ReactNode;
  tts?: ReactNode;
  printLink?: ReactNode;
};

export const CubeResources = () => {
  const cards = useAtomValue(cardsAtom);
  const cubeSetup: CubeSetup[] = [
    {
      name: "Hellscube",
      id: "HLC",
      description: "A refined version of the cube that started it all",
      cards: cards.filter((e) => e.Set === "HLC"),
      quickLink: <StyledLink to="one">Rules and macros</StyledLink>,
      tts: (
        <StyledLink
          to={
            "https://steamcommunity.com/sharedfiles/filedetails/?id=3009290113"
          }
        >
          Plugin by Benana
        </StyledLink>
      ),
    },
    {
      name: "Hellscube 2",
      id: "HC2",
      description: "The second cube, trades purple for clear archetypes.",
      cards: cards.filter((e) => e.Set === "HC2"),
    },
    {
      name: "Hellscube 3",
      id: "HC3",
      description: "At least it's not HC2",
      cards: cards.filter((e) => e.Set === "HC3"),
      tts: (
        <StyledLink
          to={
            "https://steamcommunity.com/sharedfiles/filedetails/?id=3309357076"
          }
        >
          Plugin by Benana
        </StyledLink>
      ),
    },
    {
      name: "Hellscube 4",
      id: "HC4",
      description: "A Vintage power cube. A rip-roaring good time",
      cards: cards.filter((e) => e.Set === "HC4"),
      printLink: (
        <StyledLink
          to={
            "https://drive.google.com/file/d/1xURrTX8zbeLhQFhPqEsI3kHEPb-lLwpE/view"
          }
        >
          PDF by killerfox3042
        </StyledLink>
      ),
    },
    {
      name: "Hellscube 5",
      id: "HC5",
      description: "L̵̨̡̧͎̩̘͓̩̬̂̈́́͒͌̔̽̈̌͗̏̈́͘͠͝Ợ̷̛̼̐͆͌̈́̑͗̆͑́̈́̓̀̚͠͝S̸̺̲͕̺̫͉̣̿̈ͅT̸̘̖͇͍͍̫̝̑͑̇̀͋̉̎̑͊͝ͅ",
      cards: getHc5(),
    },
    {
      name: "Hellscube V(eto)",
      id: "HCV",
      description: `Here's where vetoed, slotsed, and seasonal cards go. Not suitable for play.`,
      cards: cards.filter((e) => e.Set === "HCV"),
    },
    {
      name: "Hellscube 6",
      id: "HC6",
      description: "The Commander Cube",
      cards: cards.filter((e) => e.Set === "HC6"),
      printLink: (
        <StyledLink
          to={
            "https://drive.google.com/file/d/1-kirKSuVUPrgRfMWYt3rhqDQlAbZhKws/view"
          }
        >
          PDF by killerfox3042
        </StyledLink>
      ),
    },
    {
      name: "HC Constructed",
      id: "HCC",
      description:
        "Cards that are legal in constructed, but are not in any cube",
      cards: cards.filter((e) => e.Set === "HCC"),
    },
    {
      name: "Hells Chase Posse",
      id: "HCP",
      description: "Planes and Phenomena for some sick planechase action",
      cards: cards.filter((e) => e.Set === "HCP"),
      printLink: (
        <StyledLink
          to={
            "https://drive.google.com/file/d/1LsaqqKCsaGdBMQtFF0w7yfGwqlkcE41H/view?usp=sharing"
          }
        >
          PDF by hostus
        </StyledLink>
      ),
    },
    {
      name: "Hellscube 7",
      id: "HC7",
      description: "The 7th cube, purple abounds.",
      cards: cards.filter((e) => e.Set === "HC7.0" || e.Set === "HC7.1"),
    },
    {
      name: "Normal Cube",
      id: "C",
      description: "How did that get in there?",
      cards: cards.filter((e) => e.Set === "C"),
    },
    {
      name: "Heckscube",
      id: "HCK",
      description:
        "This minicube brings you cards of the quality and caliber of the Portal sets, one of WotC's first forays into \"beginner-friendly\" Magic all the way back in '97.",
      cards: cards.filter((e) => e.Set === "HCK"),
    },
  ];
  return (
    <Container>
      <StyledTable>
        <caption>Cube Resources</caption>
        <StyledRow>
          <StyledTableHeader>Name</StyledTableHeader>
          <StyledTableHeader>Id</StyledTableHeader>
          <StyledTableHeader>Description</StyledTableHeader>
          <StyledTableHeader>Quick links</StyledTableHeader>
          <StyledTableHeader>TableTop Simulator</StyledTableHeader>
          <StyledTableHeader>cockatrice</StyledTableHeader>
          <StyledTableHeader>draftmancer</StyledTableHeader>
          <StyledTableHeader>self print</StyledTableHeader>
        </StyledRow>
        {cubeSetup.map((e) => {
          return (
            <StyledRow key={e.id}>
              <StyledTD>{e.name}</StyledTD>
              <StyledTD>{e.id}</StyledTD>
              <StyledTD>{e.description}</StyledTD>
              <StyledTD>{e.quickLink || "None"}</StyledTD>
              <StyledTD>
                {e.tts || (
                  <button
                    onClick={() => {
                      const filtered = e.cards;

                      const val = toDeck(filtered);
                      const url =
                        "data:text/plain;base64," +
                        btoa(unescape(encodeURIComponent(JSON.stringify(val))));
                      const a = document.createElement("a");
                      a.style.display = "none";
                      a.href = url;
                      // the filename you want
                      a.download = e.name + `.json`;
                      document.body.appendChild(a);
                      a.click();
                    }}
                  >
                    download
                  </button>
                )}
              </StyledTD>
              <StyledTD>
                <button
                  onClick={() => {
                    const val = toCockCube({
                      set: e.id,
                      name: e.name,
                      cards: e.cards,
                    });

                    const url =
                      "data:text/plain;base64," +
                      btoa(unescape(encodeURIComponent(val)));
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    // the filename you want
                    a.download = e.name + ".xml";
                    document.body.appendChild(a);
                    a.click();
                  }}
                >
                  download
                </button>
              </StyledTD>
              <StyledTD>
                <button
                  onClick={() => {
                    const val = toDraftmancerCube({
                      set: e.id,

                      cards: e.cards,
                    });

                    const url =
                      "data:text/plain;base64," +
                      btoa(unescape(encodeURIComponent(val)));
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    // the filename you want
                    a.download = e.name + " (Draftmancer).txt";
                    document.body.appendChild(a);
                    a.click();
                  }}
                >
                  download
                </button>
              </StyledTD>
              <StyledTD>{e.printLink || "None"}</StyledTD>
            </StyledRow>
          );
        })}
      </StyledTable>
    </Container>
  );
};

const StyledLink = styled(Link)({
  // textDecoration: "none",
  //color: "black",
});
const Container = styled.div({ padding: "10px" });

const StyledTable = styled("table")({
  border: "1px solid black",
  "tr:nth-child(even)": { backgroundColor: "#f2f2f2" },
});
const StyledRow = styled("tr")({
  ":hover": { backgroundColor: "#C690FF !important" }, // The even selector is more specific than  this one. boo, hiss
});
const StyledTableHeader = styled("th")({ textAlign: "start" });
const StyledTD = styled("td")({ overflowY: "hidden" });
