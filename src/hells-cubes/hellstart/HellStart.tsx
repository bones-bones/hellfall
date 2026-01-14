import { useAtomValue } from "jotai";
import { cardsAtom } from "../../hellfall/cardsAtom";
import styled from "@emotion/styled";
import { hcjFrontCards, HCJPackInfo } from "./hcj";

export const HellStart = () => {
  const cards = useAtomValue(cardsAtom);

  return (
    <Container>
      <pre>
        8 person &quot;draft&quot;format. each player receives four packs, and
        drafts one. they are then passed three packs, and may pick one. the
        remaining two packs are discarded/unused. each player now has two packs
        that compose their jumpstart boosters. games are best of 1. pack page is
        formated to copy/paste into cock easily.
      </pre>
      Packs
      <div>
        {hcjFrontCards.map((entry) => (
          <HCJPackDisplay key={entry.tag} entry={entry} />
        ))}
      </div>
    </Container>
  );
};

const Container = styled.div({});

const HCJPackDisplay = ({ entry }: { entry: HCJPackInfo }) => {
  return (
    <div>
      <h3>{entry.name}</h3>
      <img src={entry.url} />
      ...
    </div>
  );
};
