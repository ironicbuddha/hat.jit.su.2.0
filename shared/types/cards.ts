export type CardPackId = 'fibonacci' | 'tshirt';

export type CardPack = {
  id: CardPackId;
  label: string;
  cards: string[];
};

export const CARD_PACKS: CardPack[] = [
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '?'],
  },
  {
    id: 'tshirt',
    label: 'T-Shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', '?'],
  },
];

export function isCardPackId(value: string): value is CardPackId {
  return CARD_PACKS.some((pack) => pack.id === value);
}

export function getCardPack(cardPackId: CardPackId): CardPack {
  return CARD_PACKS.find((pack) => pack.id === cardPackId) ?? CARD_PACKS[0];
}
