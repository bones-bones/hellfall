import { useState, useEffect } from "react";
import { Land } from "./types";

export const useLands = () => {
  const [lands, setLands] = useState<Land[]>([]);
  useEffect(() => {
    import("../data/lands.json").then(({ data }: any) => {
      setLands(data);
    });
  }, []);
  return lands;
};
