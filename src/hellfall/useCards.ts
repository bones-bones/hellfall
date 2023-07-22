import { useState, useEffect } from "react";
import { HCEntry } from "../types";

export const useCards = () => {
  const [cards, setCards] = useState<HCEntry[]>([]);
  useEffect(() => {
    import("../data/Hellscube-Database.json").then(({ data }: any) => {
      setCards(data);
    });
  }, []);
  return cards;
};
