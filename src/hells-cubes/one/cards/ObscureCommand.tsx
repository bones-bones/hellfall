export const ObscureCommand = () => {
  const commands = [
    " Destroy all artifacts.",
    "Destroy all enchantments.",
    "Destroy all creatures with mana value 3 or less.",
    "Destroy all creatures with mana value 4 or greater.",
    "Counter target spell.",
    "Return target permanent to its owner’s hand.",
    "Tap all creatures your opponents control.",
    "Draw a card.",
    "~ deals 4 damage to target player or planeswalker.",
    "~ deals 2 damage to each creature.",
    "Destroy target nonbasic land.",
    "Each player discards all the cards in their hand, then draws that many cards.",
    "Target player gains 7 life.",
    "Put target noncreature permanent on top of its owner’s library.",
    "Target player shuffles their graveyard into their library.",
    "Search your library for a creature card, reveal it, put it into your hand, then shuffle.",
    "Target player loses X life.",
    "Return target creature card with mana value X or less from your graveyard to the battlefield.",
    "Target creature gets -X/-X until end of turn.",
    "Up to X target creatures gain fear until end of turn. (They can’t be blocked except by artifact creatures and/or black creatures.)",
  ];

  return (
    <>
      {[1, 2, 3, 4].map((entry) => {
        return (
          <>
            <h3>
              {entry}. {commands[Math.floor(Math.random() * commands.length)]}
            </h3>
          </>
        );
      })}
    </>
  );
};
