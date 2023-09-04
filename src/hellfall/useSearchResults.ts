import { useState, useEffect } from "react";
import { HCEntry } from "../types";
import { useCards } from "./useCards";
import { useAtomValue, useSetAtom } from "jotai";
import {
  creatorsAtom,
  legalityAtom,
  nameSearchAtom,
  offsetAtom,
  rulesSearchAtom,
  searchCmcAtom,
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
  const setOffset = useSetAtom(offsetAtom);
  const sortRule = useAtomValue(sortAtom);
  const creators = useAtomValue(creatorsAtom);
  const colorIdentity = useAtomValue(searchColorsIdentityAtom);

  useEffect(() => {
    setResultSet(
      cards
        .filter((entry) => {
          if (set.length > 0 && !set.includes(entry.Set)) {
            return false;
          }

          if (
            rulesSearch.length > 0 &&
            !rulesSearch.every((searchTerm) => {
              const combined = entry["Text Box"].join(",").toLowerCase();
              if (searchTerm.startsWith("!")) {
                return !combined.includes(
                  searchTerm.substring(1).toLowerCase()
                );
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
          if (legality == "legal" && entry.Constructed === "Banned") {
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
                return !combined.includes(
                  searchTerm.substring(1).toLowerCase()
                );
              } else {
                return combined.includes(searchTerm.toLowerCase());
              }
            })
          ) {
            return false;
          }
          if (
            searchColors.length > 0 &&
            !(
              entry["Color(s)"]
                .split(";")
                .every((colorEntry) =>
                  (searchColors.includes("Misc bullshit")
                    ? [...searchColors, "Piss", "Pickle"]
                    : searchColors
                  ).includes(colorEntry)
                ) ||
              (searchColors.includes("Colorless") && entry["Color(s)"] == "")
            )
          ) {
            return false;
          }
          return true;
        })
        .sort(sortFunction(sortRule))
    );
    setOffset(0);

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
  ]);

  return resultSet;
};
