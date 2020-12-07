import { Card } from "./card.model";

export interface HandProps {
  cards: Card[];
  cardBeingSwapped: number;
  cardSwapConfirmed: boolean;
  roundState: number;
  selectedCardIndex: number;
  cardClicked: (index: number) => {};
}
