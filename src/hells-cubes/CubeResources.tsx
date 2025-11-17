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
import { toMPCAutofill } from "./toMPCAutofill";

type CubeSetup = {
  name: string;
  id: string;
  description: string;
  cards: HCEntry[];
  quickLink?: ReactNode;
  tts?: ReactNode;
  printLink?: ReactNode;
  readyForAutofill?: boolean;
  includeLands?: boolean;
};

export const CubeResources = () => {
  const cards = useAtomValue(cardsAtom);
  const cubeSetups: CubeSetup[] = [
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
      includeLands: true,
      readyForAutofill: true,
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
      readyForAutofill: true,
      includeLands: true,
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
      readyForAutofill: true,

      description:
        "Cards that are legal in constructed, but are not in any cube",
      cards: cards.filter((e) => e.Set === "HCC"),
    },
    {
      name: "Hells Chase Posse",
      id: "HCP",
      readyForAutofill: true,
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
      readyForAutofill: true,
      includeLands: true,
      description:
        "This minicube brings you cards of the quality and caliber of the Portal sets, one of WotC's first forays into \"beginner-friendly\" Magic all the way back in '97.",
      cards: cards.filter((e) => e.Set === "HCK"),
    },
    {
      name: "Hellscube 8",
      id: "HC8",
      description: "The 8th cube, we've got archetypes",
      cards: cards.filter((e) => e.Set === "HC8.0" || e.Set === "HC8.1"),
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
          <StyledTableHeader>mpc autofill</StyledTableHeader>
          <StyledTableHeader>self print</StyledTableHeader>
        </StyledRow>
        {cubeSetups.map((cubeSetup) => {
          return (
            <StyledRow key={cubeSetup.id}>
              <StyledTD>{cubeSetup.name}</StyledTD>
              <StyledTD>{cubeSetup.id}</StyledTD>
              <StyledTD>{cubeSetup.description}</StyledTD>
              <StyledTD>{cubeSetup.quickLink || "None"}</StyledTD>
              <StyledTD>
                {cubeSetup.tts || (
                  <button
                    onClick={() => {
                      const filtered = cubeSetup.cards;

                      const val = toDeck(filtered);
                      const url =
                        "data:text/plain;base64," +
                        btoa(unescape(encodeURIComponent(JSON.stringify(val))));
                      const a = document.createElement("a");
                      a.style.display = "none";
                      a.href = url;
                      // the filename you want
                      a.download = cubeSetup.name + `.json`;
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
                      set: cubeSetup.id,
                      name: cubeSetup.name,
                      cards: cubeSetup.cards,
                    });

                    const url =
                      "data:text/plain;base64," +
                      btoa(unescape(encodeURIComponent(val)));
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    // the filename you want
                    a.download = cubeSetup.name + ".xml";
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
                      set: cubeSetup.id,
                      cards: cubeSetup.cards,
                    });

                    const url =
                      "data:text/plain;base64," +
                      btoa(unescape(encodeURIComponent(val)));
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    // the filename you want
                    a.download = cubeSetup.name + " (Draftmancer).txt";
                    document.body.appendChild(a);
                    a.click();
                  }}
                >
                  download
                </button>
              </StyledTD>
              <StyledTD>
                {cubeSetup.readyForAutofill ? (
                  <button
                    onClick={async () => {
                      const cardList = (
                        await (
                          await fetch(
                            "https://hellfall-autofill-821285593003.europe-west1.run.app/"
                          )
                        ).json()
                      ).values
                        .map((entry: any, i: any) => {
                          if (i !== 0) {
                            return {
                              Cardname: entry[0],
                              Sidename: entry[1],
                              Url: entry[2],
                            };
                          }
                        })
                        .filter(Boolean) as {
                        Cardname: string;
                        Sidename: string;
                        Url: string;
                      }[];

                      const tokenNames = cubeSetup.cards.flatMap((entry) => {
                        // Dear sixel, pls finish
                        // console.log(entry);
                        return (entry.tokens || []).map((tokenEntry) =>
                          tokenEntry.Name.replace(/ (\d+)$/g, "$1")
                        );
                      });
                      const printableTokens = tokenNames.map((tokenEntry) => {
                        const matches = cardList.filter((e) => {
                          // if (e.Cardname.includes("Food12")) {
                          //   console.log(e);
                          // }
                          return e.Cardname == tokenEntry;
                        });
                        console.log(printableTokens);

                        // { cardName: string; sides: { id: string }[] };
                        const returnEntry = {
                          cardName: tokenEntry,
                          sides: matches.map((matchEntry) => ({
                            id: matchEntry.Url.replace(
                              "https://lh3.googleusercontent.com/d/",
                              ""
                            ),
                          })),
                        };

                        return returnEntry;
                      });

                      const printableCards = cubeSetup.cards.map(
                        (cardEntry) => {
                          const matches = cardList.filter(
                            (e) => e.Cardname == cardEntry.Name
                          );
                          if (cardEntry.Name.includes("// Elves")) {
                            console.log(cardList, matches);
                          }
                          // { cardName: string; sides: { id: string }[] };
                          const returnEntry = {
                            cardName: cardEntry.Name,
                            sides: matches.map((matchEntry) => ({
                              id: matchEntry.Url.replace(
                                "https://lh3.googleusercontent.com/d/",
                                ""
                              ),
                            })),
                          };
                          return returnEntry;
                        }
                      );
                      toMPCAutofill(
                        [
                          ...printableCards,
                          ...(cubeSetup.includeLands ? getLands() : []),
                          ...printableTokens,
                        ].filter(Boolean)
                      );
                    }}
                  >
                    download
                  </button>
                ) : (
                  "None"
                )}
              </StyledTD>
              <StyledTD>{cubeSetup.printLink || "None"}</StyledTD>
            </StyledRow>
          );
        })}
      </StyledTable>
    </Container>
  );
};

const getLands = () => {
  return [
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Swamp",
        sides: [{ id: "1RZtCEa2plk-4bVKBL1MdJEjJsRgI5Ht6" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Plains",
        sides: [{ id: "1YIIJG4MdOyP6v6LgeYTztMn_CFOD5e6t" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(
        () => ({
          cardName: "Mountain",
          sides: [{ id: "1CdSPdzbINcylm8xNemUjFoCLauyAU14X" }],
        }),
        ...Array(40)
          .fill(undefined)
          .map(() => ({
            cardName: "Island",
            sides: [{ id: "1gF3_D9K5D7GbmObO3K2PJz96hBnx-ukK" }],
          })),
        ...Array(40)
          .fill(undefined)
          .map(() => ({
            cardName: "Forest",
            sides: [{ id: "1kuDXNzDdjSGFhTQ8o53E_dVuVUFtvymg" }],
          }))
      ),
  ];
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
