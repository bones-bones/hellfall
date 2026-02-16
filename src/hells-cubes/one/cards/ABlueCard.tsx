import { HellsCard } from '../HellsCard';

export const ABlueCard = () => {
  const stormCards = [
    `!"Dig+through+time"`,
    `!"narset,+parter+of+veils"`,
    `!"reef+worm"`,
    `!"cryptic+command"`,
    `!"cyclonic+rift"`,
    `!"aether+gale"`,
    `!"fact+or+fiction"`,
    `!"nezahal,+primal+tide"`,
    `!"ovinomancer"`,
    `!"johnny,+combo+player"`,
    `!"gilded+drake"`,
    `!"cunning+wish"`,
    `!"timetwister"`,
    `!"force+of+will"`,
    `!"temporal+manipulation"`,
    `!"spy+eye"`,
    `!"stream+of+thought"`,
    `!"urza,+lord+high+artificer"`,
    `!"sudden+substitution"`,
    `!"snapcaster+mage"`,
  ];
  return <HellsCard queryString={stormCards[Math.floor(Math.random() * stormCards.length)]} />;
};
