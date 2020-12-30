import { Player } from "./player.model";
import { CardValue, CardIF } from "./card.model";
import { Marble } from "./marble.model";
import { ActionNumber } from "./action.model";


export interface GameComponentProps {
    player: Player | null;
    gameID: string;
}

export interface GameComponentState {
  numberOfPlayers: 4 | 6;
  players: Player[];
  activePlayerIndex: number | null;
  playerIsActive: boolean;
  cards: CardIF[];
  allMarbles: Marble[];
  marbles: Marble[];
  gameState: number | null;
  roundState: number | null;
  topCard: CardIF | null;
  switchingSeats: boolean;
  selectedCardIndex: number | null;
  // possibleMoves: Action[];
  selectedCardRequiresTooltip: boolean;
  selectedMarble: Marble | null;
  tooltipActions: ActionNumber[];
  tooltipVisible: boolean,
  marbleToSwitch: Marble | null;
  marblesToSelect: number;
  cardSwapConfirmed: boolean;
  cardBeingSwapped: number;
  remainingStepsOf7: number;
  errorMessage: string | undefined;
  jokerCardValue: CardValue;
}

export interface PlayerState extends Player {
  hand: CardIF[];
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
  top_card: CardIF;
}
