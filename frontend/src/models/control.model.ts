import { CardIF, CardValue } from "./card.model";
import { HandProps } from "./hand.model";
import { Player } from "./player.model";

export interface ControlProps extends HandProps {
  numberOfPlayers: number;
  players: Player[];

  selectedCard: CardIF | null;
  cards: CardIF[];

  roundState: number | null;
  gameState: number | null;

  startGame: () => void;
  switchSeats: () => void;
  errorMessage: string | undefined;


  setJokerCardValue: (value: CardValue) => void;
  fold: () => void;
  swapCard: () => void;
  cardClicked: (i: number) => void;
  

  switchingSeats: boolean;
  jokerCardValue: CardValue
  playerIsActive: boolean;
}
