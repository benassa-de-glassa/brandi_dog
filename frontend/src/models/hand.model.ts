import { CardIF } from "./card.model";

export interface HandProps {
  cards: CardIF[];
  cardBeingSwapped: number;
  cardSwapConfirmed: boolean;
  roundState: number | null;
  selectedCardIndex: number | null;
  cardClicked: (index: number) => void;
}
