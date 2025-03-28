import { useState, useEffect } from "react";
import { HCEntry } from "../types";
import { cardsAtom } from "./cardsAtom";
import { useAtom, useAtomValue } from "jotai";
import {
  activeCardAtom,
  creatorsAtom,
  legalityAtom,
  nameSearchAtom,
  offsetAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorComparisonAtom,
  searchColorsAtom,
  searchColorsIdentityAtom,
  searchSetAtom,
  sortAtom,
  typeSearchAtom,
  isCommanderAtom,
  powerAtom,
  toughnessAtom,
  tagsAtom,
  extraFiltersAtom,
} from "./searchAtoms";
import { sortFunction } from "./sortFunction";
import { getColorIdentity } from "./getColorIdentity";
import { canBeACommander } from "./canBeACommander";
import { MISC_BULLSHIT, MISC_BULLSHIT_COLORS } from "./constants";

const isSetInResults = (set: string, setOptions: string[]) => {
  return Boolean(setOptions.find((e) => set.includes(e)));
};

export const useSearchResults = () => {
  const [resultSet, setResultSet] = useState<HCEntry[]>([]);
  const cards = useAtomValue(cardsAtom);
  const set = useAtomValue(searchSetAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const nameSearch = useAtomValue(nameSearchAtom);
  const searchCmc = useAtomValue(searchCmcAtom);
  const legality = useAtomValue(legalityAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const sortRule = useAtomValue(sortAtom);
  const creators = useAtomValue(creatorsAtom);
  const colorIdentityCriteria = useAtomValue(searchColorsIdentityAtom);
  const activeCard = useAtomValue(activeCardAtom);
  const colorComparison = useAtomValue(searchColorComparisonAtom);
  const isCommander = useAtomValue(isCommanderAtom);
  const [page, setPageAtom] = useAtom(offsetAtom);
  const power = useAtomValue(powerAtom);
  const toughness = useAtomValue(toughnessAtom);
  const tags = useAtomValue(tagsAtom);
  const extraFilters = useAtomValue(extraFiltersAtom);

  useEffect(() => {
    const tempResults = cards
      .filter((entry) => {
        if (set.length > 0 && !isSetInResults(entry.Set, set)) {
          return false;
        }
        if (!extraFilters.includes("isToken") && entry.isActualToken) {
          return false;
        }
        if (extraFilters.includes("isToken") && !entry.isActualToken) {
          return false;
        }

        if (
          rulesSearch.length > 0 &&
          !rulesSearch.every((searchTerm) => {
            const combined = (entry["Text Box"] || []).join(",").toLowerCase();
            if (searchTerm.startsWith("!")) {
              return !combined.includes(searchTerm.substring(1).toLowerCase());
            } else {
              return combined.includes(searchTerm.toLowerCase());
            }
          })
        ) {
          return false;
        }

        if (
          tags.length > 0 &&
          !tags.every((tag) => {
            return entry.Tags?.includes(tag);
          })
        ) {
          return false;
        }

        if (
          nameSearch !== "" &&
          !entry["Name"].toLowerCase().includes(nameSearch.toLowerCase())
        ) {
          return false;
        }

        if (searchCmc != undefined) {
          switch (searchCmc.operator) {
            case "<": {
              if (!(entry.CMC < searchCmc.value)) {
                return false;
              }
              break;
            }
            case ">": {
              if (!(entry.CMC > searchCmc.value)) {
                return false;
              }
              break;
            }
            case "=": {
              if (!(entry.CMC === searchCmc.value)) {
                return false;
              }
              break;
            }
          }
        }

        if (isCommander === true) {
          if (!canBeACommander(entry)) {
            return false;
          }
        }
        if (legality === "legal" && entry.Constructed === "Banned") {
          return false;
        }
        if (creators.length > 0 && !creators.includes(entry.Creator)) {
          return false;
        }
        if (
          colorIdentityCriteria.length > 0 &&
          !getColorIdentity(entry).every((cardColorIdentityComponent) => {
            // if (entry.Name.includes("The Big Banana")) {
            //   console.log(colorIdentityCriteria);
            // }
            const miscBullshitColorIdentityCriteria =
              colorIdentityCriteria.includes(MISC_BULLSHIT)
                ? [...colorIdentityCriteria, ...MISC_BULLSHIT_COLORS].filter(
                    (e) => e !== MISC_BULLSHIT
                  )
                : colorIdentityCriteria;
            if (Array.isArray(cardColorIdentityComponent)) {
              return (
                cardColorIdentityComponent.filter((e) => {
                  return (
                    miscBullshitColorIdentityCriteria.includes(e) ||
                    e === undefined
                  );
                }).length >= 1
              );
            } else {
              return miscBullshitColorIdentityCriteria.includes(
                cardColorIdentityComponent
              );
            }
          })
        ) {
          return false;
        }
        if (
          typeSearch.length > 0 &&
          !typeSearch.every((searchTerm) => {
            const combined = [
              ...(entry["Supertype(s)"] || []),
              ...(entry["Card Type(s)"] || []),
              ...(entry["Subtype(s)"] || []),
            ]
              .join(",")
              .toLowerCase();
            if (searchTerm.startsWith("!")) {
              return !combined.includes(searchTerm.substring(1).toLowerCase());
            } else {
              return combined.includes(searchTerm.toLowerCase());
            }
          })
        ) {
          return false;
        }
        if (power) {
          switch (power.operator) {
            case "=": {
              if (parseInt(entry.power?.[0] + "") !== power.value) {
                return false;
              }
              break;
            }
            case "<": {
              if (
                !entry.power?.[0] ||
                !(
                  (Number.isNaN(parseInt(entry.power[0] + ""))
                    ? 0
                    : parseInt(entry.power[0] + "")) < power.value
                )
              ) {
                return false;
              }
              break;
            }
            case ">": {
              if (
                !entry.power?.[0] ||
                !(
                  (Number.isNaN(parseInt(entry.power[0] + ""))
                    ? 0
                    : parseInt(entry.power[0] + "")) > power.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }
        if (toughness) {
          switch (toughness.operator) {
            case "=": {
              if (parseInt(entry.toughness?.[0] + "") !== toughness.value) {
                return false;
              }
              break;
            }
            case "<": {
              if (
                !entry.toughness?.[0] ||
                !(
                  (Number.isNaN(parseInt(entry.toughness[0] + ""))
                    ? 0
                    : parseInt(entry.toughness[0] + "")) < toughness.value
                )
              ) {
                return false;
              }
              break;
            }
            case ">": {
              if (
                !entry.toughness?.[0] ||
                !(
                  (Number.isNaN(parseInt(entry.toughness[0] + ""))
                    ? 0
                    : parseInt(entry.toughness[0] + "")) > toughness.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }

        if (searchColors.length > 0) {
          if (
            !(searchColors.includes("Colorless") && entry["Color(s)"] == "")
          ) {
            const newSearchColors = searchColors.includes(MISC_BULLSHIT)
              ? [...searchColors]
              : searchColors;

            const entryColors = (entry["Color(s)"] || "")
              .split(";")
              .map((colorEntry) => {
                if (
                  ![
                    "Red",
                    "Green",
                    "White",
                    "Blue",
                    "Black",
                    "Purple",
                    "",
                  ].includes(colorEntry)
                ) {
                  return MISC_BULLSHIT;
                }
                return colorEntry;
              });

            switch (colorComparison) {
              case "<=": {
                if (
                  !entryColors.every((colorEntry) =>
                    newSearchColors.includes(colorEntry)
                  )
                ) {
                  return false;
                }
                break;
              }
              case "=": {
                if (
                  !(
                    entryColors.every((colorEntry) =>
                      newSearchColors.includes(colorEntry)
                    ) && entryColors.length == newSearchColors.length
                  )
                ) {
                  return false;
                }
                break;
              }
              case ">=": {
                if (
                  !entryColors.find((colorEntry) =>
                    newSearchColors.includes(colorEntry)
                  )
                ) {
                  return false;
                }

                break;
              }
            }
          }
        }

        return true;
      })
      .sort(sortFunction(sortRule));

    setResultSet(tempResults);

    const searchToSet = new URLSearchParams();

    if (nameSearch != "") {
      searchToSet.append("name", nameSearch);
    }
    if (typeSearch.length > 0) {
      searchToSet.append("type", typeSearch.join(","));
    }
    if (rulesSearch.length > 0) {
      searchToSet.append("rules", rulesSearch.join(","));
    }
    if (set.length > 0) {
      searchToSet.append("set", set.join(","));
    }
    if (searchColors.length > 0) {
      searchToSet.append("colors", searchColors.join(","));
    }
    if (colorIdentityCriteria.length > 0) {
      searchToSet.append("colorIdentity", colorIdentityCriteria.join(","));
    }
    if (searchCmc !== undefined) {
      searchToSet.append("manaValue", JSON.stringify(searchCmc));
    }
    if (legality !== "") {
      searchToSet.append("legality", legality);
    }
    if (creators.length > 0) {
      searchToSet.append("creator", creators.join(",,"));
    }
    if (isCommander) {
      searchToSet.append("isCommander", "true");
    }
    if (activeCard !== "") {
      searchToSet.append("activeCard", activeCard);
    }
    if (colorComparison !== "<=") {
      searchToSet.append("colorComparison", colorComparison);
    }
    if (power) {
      searchToSet.append("p", `${power.operator}${power.value}`);
    }
    if (toughness) {
      searchToSet.append("t", `${toughness.operator}${toughness.value}`);
    }
    if (tags.length > 0) {
      searchToSet.append("tags", tags.join(","));
    }

    if (tempResults.length < page && tempResults.length > 0) {
      searchToSet.append("page", "0");
      setPageAtom(0);
    } else if (page > 0) {
      searchToSet.append("page", page.toString());
    }

    history.pushState(
      undefined,
      "",
      location.origin + location.pathname + "?" + searchToSet.toString()
    );
  }, [
    rulesSearch,
    set,
    searchColors,
    nameSearch,
    sortRule,
    typeSearch,
    searchCmc,
    tags,
    cards.length,
    legality,
    creators,
    colorIdentityCriteria,
    activeCard,
    page,
    colorComparison,
    isCommander,
    power,
    toughness,
  ]);

  return resultSet;
};
