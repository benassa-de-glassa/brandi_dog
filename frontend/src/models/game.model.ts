import { Player } from "./player.model";
import { Card, CardKey } from "./card.model";
import { Marble } from "./marble.model";

export interface GameComponentProps {
    player: Player;
    gameID: string;
}

export interface GameComponentState {
  numberOfPlayers: number;
  players: Player[];
  activePlayerIndex: number | null;
  playerIsActive: boolean;
  cards: Card[];
  allMarbles: Marble[];
  marbles: Marble[];
  gameState: number | null;
  roundState: number | null;
  topCard: Card | null;
  switchingSeats: boolean;
  selectedCardIndex: number | null;
  selectedCardRequiresTooltip: boolean;
  selectedMarble: Marble | null;
  tooltipActions: number[];
  marbleToSwitch: Marble | null;
  marblesToSelect: number;
  cardSwapConfirmed: boolean;
  cardBeingSwapped: number;
  remainingStepsOf7: number;
  errorMessage: string | undefined;
  jokerCard: [key in CardKey];
}

export interface PlayerState {
  uid: number;
  username: string;
  hand: Card[];
  marbles: Marble[];
  steps_of_seven: number;
}

export interface GameState {
  game_id: string;
  game_name: string;
  n_players: number;
  host: Player;
  game_state: number;
  round_state: number;
  round_turn: number;
  order: number[];
  active_player_index: number;
  players: { [key: number]: PlayerState };
  player_list: Player[];
  top_card: Card;
}
