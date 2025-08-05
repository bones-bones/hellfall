import { recursiveAdoption } from "./recursiveAdoption";

const BRACKETS = [
  612, 504, 396, 234, 216, 198, 180, 162, 144, 126, 108, 90, 72, 55, 36, 18,
];

type CardToFill = { cardName: string; sides: { id: string }[] };

export const toMPCAutofill = (cards: CardToFill[]) => {
  console.log({ cards });
  const printingBrackets: { size: number; cards: CardToFill[] }[] = [];
  while (cards.length > 0) {
    chunking: for (const bracketSize of BRACKETS) {
      if (cards.length === 0) {
        break chunking;
      }
      if (cards.length > bracketSize) {
        printingBrackets.push({
          size: bracketSize,
          cards: cards.splice(0, bracketSize),
        });

        break chunking;
      }

      printingBrackets.push({
        size: bracketSize,
        cards: cards.splice(0, bracketSize),
      });
    }
  }

  for (const orderSegment of printingBrackets) {
    const xmlDoc = document.implementation.createDocument(null, "order");
    const details = xmlDoc.createElement("details");
    const quantity = xmlDoc.createElement("quantity");
    quantity.textContent = orderSegment.cards.length.toString();
    const bracket = xmlDoc.createElement("bracket");
    bracket.textContent = orderSegment.size.toString();
    const stock = xmlDoc.createElement("stock");
    stock.textContent = "(S30) Standard Smooth";
    const foil = xmlDoc.createElement("foil");
    foil.textContent = "false";

    // Fronts block
    const fronts = xmlDoc.createElement("fronts");
    orderSegment.cards.forEach((card, index) => {
      console.log(card);
      // @ts-ignore
      const existingCard = [...fronts.querySelectorAll("card")].find(
        (e) => e.querySelector("id").textContent == card.sides[0].id
      );
      if (existingCard) {
        existingCard.querySelector("slots").textContent = `${
          existingCard.querySelector("slots").textContent
        },${index}`;
      } else {
        const newCard = xmlDoc.createElement("card");
        const id = xmlDoc.createElement("id");
        id.textContent = card.sides[0].id;
        const slots = xmlDoc.createElement("slots");
        slots.textContent = index.toString();
        const name = xmlDoc.createElement("name");
        name.textContent = card.cardName + ".png";

        const query = xmlDoc.createElement("query");
        query.textContent = card.cardName;
        recursiveAdoption(fronts, [newCard, [id, slots, name, query]]);
      }
    });

    // backs
    const backs = xmlDoc.createElement("backs");
    orderSegment.cards.forEach((card, index) => {
      if (card.sides.length > 1) {
        console.log("back");
      }
      if (card.sides.length == 1) {
        return;
      }
      // @ts-ignore
      const existingCard = [...backs.querySelectorAll("card")].find(
        (e) => e.querySelector("id").textContent == card.sides[1].id
      );
      if (existingCard) {
        existingCard.querySelector("slots").textContent = `${
          existingCard.querySelector("slots").textContent
        },${index}`;
      } else {
        const newCard = xmlDoc.createElement("card");
        const id = xmlDoc.createElement("id");
        id.textContent = card.sides[1].id;
        const slots = xmlDoc.createElement("slots");
        slots.textContent = index.toString();
        const name = xmlDoc.createElement("name");
        name.textContent = card.cardName + ".png";

        const query = xmlDoc.createElement("query");
        query.textContent = card.cardName;
        recursiveAdoption(backs, [newCard, [id, slots, name, query]]);
      }
    });

    const cardBack = xmlDoc.createElement("cardback");
    cardBack.textContent = "17ggqviE7RYfYxcW3oJTHhKlTFA5TrJfX";

    recursiveAdoption(xmlDoc.documentElement, [
      details,
      [quantity, bracket, stock, foil],
      fronts,
      backs,
      cardBack,
    ]);

    const docAsString = new XMLSerializer().serializeToString(
      xmlDoc.documentElement
    );

    const url =
      "data:text/plain;base64," +
      btoa(unescape(encodeURIComponent(docAsString)));
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    // the filename you want
    a.download = "mpc_fill" + printingBrackets.indexOf(orderSegment) + ".xml";
    document.body.appendChild(a);
    a.click();
  }
};
