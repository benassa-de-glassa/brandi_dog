import { Card } from "./card.model";
import { HandProps } from "./hand.model";
import { Player } from "./player.model";

export interface ControlProps extends HandProps {
  selectedCard: Card;
  cards: Card[];

  startGame: () => void;
  switchSeats: () => void;
  errorMessage: string;

  roundState: number;
  gameState: number;
  players: Player[];
  numberOfPlayers: number;

  switchingSeats: boolean;
  setJokerCard: (card: Card) => void;

  playerIsActive: boolean;
  fold: () => void;
  swapCard: () => void;
}
