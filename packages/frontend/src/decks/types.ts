export type CardEntry = { name: string; count: number };

export type DeckInfo = {
  cards: {
    main: CardEntry[];
    sideboard: CardEntry[];
  };
  author: string;
  text: string;
  title: string;
};
