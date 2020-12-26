import { CardIF, CardKey } from "./card.model";
import { HandProps } from "./hand.model";
import { Player } from "./player.model";

export interface ControlProps extends HandProps {
  selectedCard: CardIF | null;
  cards: CardIF[];

  startGame: () => void;
  switchSeats: () => void;
  errorMessage: string | undefined;

  roundState: number | null;
  gameState: number | null;
  players: Player[];
  numberOfPlayers: number;

  switchingSeats: boolean;
  jokerCardValue: keyof typeof CardKey
  setJokerCardValue: (value: keyof typeof CardKey) => void;

  playerIsActive: boolean;
  fold: () => void;
  swapCard: () => void;
}
