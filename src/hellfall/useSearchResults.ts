import { useState, useEffect } from "react";
import { HCEntry } from "../types";
import { useCards } from "./useCards";
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
} from "./searchAtoms";
import { sortFunction } from "./sortFunction";
import { getColorIdentity } from "./getColorIdentity";

export const useSearchResults = () => {
  const [resultSet, setResultSet] = useState<HCEntry[]>([]);
  const cards = useCards();
  const set = useAtomValue(searchSetAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const nameSearch = useAtomValue(nameSearchAtom);
  const searchCmc = useAtomValue(searchCmcAtom);
  const legality = useAtomValue(legalityAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const sortRule = useAtomValue(sortAtom);
  const creators = useAtomValue(creatorsAtom);
  const colorIdentity = useAtomValue(searchColorsIdentityAtom);
  const activeCard = useAtomValue(activeCardAtom);
  const colorComparison = useAtomValue(searchColorComparisonAtom);
  const [page, setPageAtom] = useAtom(offsetAtom);

  useEffect(() => {
    const tempResults = cards
      .filter((entry) => {
        if (set.length > 0 && !set.includes(entry.Set)) {
          return false;
        }

        if (
          rulesSearch.length > 0 &&
          !rulesSearch.every((searchTerm) => {
            const combined = entry["Text Box"].join(",").toLowerCase();
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
          nameSearch != "" &&
          !entry["Name"].toLowerCase().includes(nameSearch.toLowerCase())
        ) {
          return false;
        }

        if (searchCmc != undefined) {
          if (searchCmc.operator == "<" && !(entry.CMC < searchCmc.value)) {
            return false;
          }
          if (searchCmc.operator == ">" && !(entry.CMC > searchCmc.value)) {
            return false;
          }
          if (searchCmc.operator == "=" && !(entry.CMC == searchCmc.value)) {
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
          colorIdentity.length > 0 &&
          !getColorIdentity(entry).every((colorEntry) =>
            colorIdentity.includes(colorEntry)
          )
        ) {
          return false;
        }
        if (
          typeSearch.length > 0 &&
          !typeSearch.every((searchTerm) => {
            const combined = [
              ...entry["Supertype(s)"],
              ...entry["Card Type(s)"],
              ...entry["Subtype(s)"],
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

        if (searchColors.length > 0) {
          if (
            !(searchColors.includes("Colorless") && entry["Color(s)"] == "")
          ) {
            const newSearchColors = searchColors.includes("Misc bullshit")
              ? [...searchColors, "Piss", "Pickle"]
              : searchColors;

            switch (colorComparison) {
              case "<=": {
                if (
                  !entry["Color(s)"].split(";").every((colorEntry) => {
                    return newSearchColors.includes(colorEntry);
                  })
                ) {
                  return false;
                }
                break;
              }
              case "=": {
                if (
                  !(
                    entry["Color(s)"].split(";").every((colorEntry) => {
                      return newSearchColors.includes(colorEntry);
                    }) &&
                    entry["Color(s)"].split(";").length ==
                      newSearchColors.length
                  )
                ) {
                  return false;
                }
                break;
              }
              case ">=": {
                if (
                  !entry["Color(s)"].split(";").find((colorEntry) => {
                    return newSearchColors.includes(colorEntry);
                  })
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
    if (colorIdentity.length > 0) {
      searchToSet.append("colorIdentity", colorIdentity.join(","));
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
    if (activeCard !== "") {
      searchToSet.append("activeCard", activeCard);
    }
    if (colorComparison !== "<=") {
      searchToSet.append("colorComparison", colorComparison);
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
    cards.length,
    legality,
    creators,
    colorIdentity,
    activeCard,
    page,
    colorComparison,
  ]);

  return resultSet;
};
