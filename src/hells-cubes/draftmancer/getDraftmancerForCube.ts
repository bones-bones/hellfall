import { toDraftmancerCube } from "./toDraftmancer";
import { HCEntry } from "../../types";

export const getDraftmancerForCube = ({
  id,
  name,
  cards,
}: {
  id: string;
  name: string;
  cards: HCEntry[];
}) => {
  const val = toDraftmancerCube({
    set: id,
    cards: cards,
  });

  const url =
    "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  // the filename you want
  a.download = name + " (Draftmancer).txt";
  document.body.appendChild(a);
  a.click();
};
