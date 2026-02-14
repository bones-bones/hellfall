import { useState, useEffect } from "react";
import { HCEntry } from "../types";
import { cardsAtom } from "./cardsAtom";
import { useAtom, useAtomValue } from "jotai";
import {
  activeCardAtom,
  creatorsAtom,
  legalityAtom,
  idSearchAtom,
  nameSearchAtom,
  offsetAtom,
  costSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorComparisonAtom,
  searchColorsAtom,
  searchColorsIdentityAtom,
  useHybridIdentityAtom,
  searchSetAtom,
  sortAtom,
  typeSearchAtom,
  isCommanderAtom,
  powerAtom,
  toughnessAtom,
  tagsAtom,
  extraFiltersAtom,
  dirAtom,
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
  const cards = useAtomValue(cardsAtom).filter((e) => e.Set != "C");
  const set = useAtomValue(searchSetAtom);
  const costSearch = useAtomValue(costSearchAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const idSearch = useAtomValue(idSearchAtom);
  const nameSearch = useAtomValue(nameSearchAtom);
  const searchCmc = useAtomValue(searchCmcAtom);
  const legality = useAtomValue(legalityAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const sortRule = useAtomValue(sortAtom);
  const dirRule = useAtomValue(dirAtom);
  const creators = useAtomValue(creatorsAtom);
  const colorIdentityCriteria = useAtomValue(searchColorsIdentityAtom);
  const useHybrid = useAtomValue(useHybridIdentityAtom);
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
          costSearch.length > 0 &&
          !costSearch.every((searchTerm) => {
            const combined = (entry["Cost"] || []).join(",").toLowerCase();
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

        if (idSearch !== "" && entry["Id"] != idSearch) {
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
        if (legality.length > 0) {
          if (
            legality.includes("legal") &&
            entry.Constructed?.includes("Banned")
          ) {
            return false;
          }
          if (
            legality.includes("4cbLegal") &&
            entry.Constructed?.includes("Banned (4CB)")
          ) {
            return false;
          }

          if (
            legality.includes("hellsmanderLegal") &&
            entry.Constructed?.includes("Banned (Commander)")
          ) {
            return false;
          }
        }
        if (creators.length > 0 && !creators.includes(entry.Creator)) {
          return false;
        }
        if (
          colorIdentityCriteria.length > 0 &&
          !getColorIdentity(entry).every((cardColorIdentityComponent) => {
            const miscBullshitColorIdentityCriteria =
              colorIdentityCriteria.includes(MISC_BULLSHIT)
                ? [...colorIdentityCriteria, ...MISC_BULLSHIT_COLORS].filter(
                    (e) => e !== MISC_BULLSHIT
                  )
                : colorIdentityCriteria;
            const colorTest = (e: string) =>
              miscBullshitColorIdentityCriteria.includes(e) ||
              e == "Colorless" ||
              e == undefined;
            if (Array.isArray(cardColorIdentityComponent)) {
              return useHybrid
                ? cardColorIdentityComponent.some(colorTest)
                : cardColorIdentityComponent.every(colorTest);
            } else {
              return colorTest(cardColorIdentityComponent);
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
      .sort(sortFunction(sortRule, dirRule));

    setResultSet(tempResults);

    const searchToSet = new URLSearchParams();

    if (nameSearch != "") {
      searchToSet.append("name", nameSearch);
    }
    if (idSearch != "") {
      searchToSet.append("id", idSearch);
    }
    if (typeSearch.length > 0) {
      searchToSet.append("type", typeSearch.join(","));
    }
    if (costSearch.length > 0) {
      searchToSet.append("cost", costSearch.join(","));
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
    if (useHybrid) {
      searchToSet.append("useHybrid", "true");
    }
    if (searchCmc !== undefined) {
      searchToSet.append("manaValue", JSON.stringify(searchCmc));
    }
    if (legality.length > 0) {
      searchToSet.append("legality", legality.join(","));
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
    if (sortRule != "Color") {
      searchToSet.append("order", sortRule);
    }
    if (dirRule != "Asc") {
      searchToSet.append("dir", dirRule);
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
    costSearch,
    rulesSearch,
    set,
    searchColors,
    nameSearch,
    idSearch,
    sortRule,
    dirRule,
    typeSearch,
    searchCmc,
    tags,
    cards.length,
    legality,
    creators,
    colorIdentityCriteria,
    useHybrid,
    activeCard,
    page,
    colorComparison,
    isCommander,
    power,
    toughness,
  ]);

  return resultSet;
};
