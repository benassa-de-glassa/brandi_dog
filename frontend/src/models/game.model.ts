import { Player } from "./player.model";
import { CardValue, CardIF } from "./card.model";
import { Marble } from "./marble.model";
import { ActionNumber } from "./action.model";

/*
GameStateNumber can take values between 0 and 4, indicating one of the
following game states:
  - 0: initialized, waiting for players
  - 1: ready to be started
  - 2: running
  - 3: finished, ready to be purged
  - 4: purged # should never be seen
RoundStateNumber can take values between 0 and 5 indicating one of the
following round states:
  - 0: round has not yet started. This should only be the case for the very
       first round of a game
  - 1: round has started and cards have not yet been dealt
  - 2: round has started and cards have been dealt but not yet
       exchanged within the team
  - 3: round has started and cards to be exchanged have been dealt but
       not yet been shown to the teammate
  - 4: round has started and cards have been exchanged between
       teammates
  - 5: round has finished
*/

export type GameStateNumber = 0 | 1 | 2 | 3 | 4;
export type RoundStateNumber = 0 | 1 | 2 | 3 | 4 | 5;

export interface GameComponentProps {
  player: Player | null;
  gameID: string;
}

export interface GameComponentState {
  numberOfPlayers: 4 | 6;
  players: Player[];
  activePlayerIndex: number | null;
  playerIsActive: boolean;
  playerHasFinished: boolean;
  cards: CardIF[];
  marbles: { [key: number]: Marble };
  gameState: GameStateNumber | null;
  roundState: number | null;
  topCard: CardIF | null;
  switchingSeats: boolean;
  selectedCardIndex: number | null;
  // possibleMoves: Action[];
  selectedCardRequiresTooltip: boolean;
  selectedMarble: Marble | null;
  tooltipActions: ActionNumber[];
  tooltipVisible: boolean;
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
  game_state: GameStateNumber;
  round_state: RoundStateNumber;
  round_turn: number;
  order: number[];
  active_player_index: number;
  players: { [key: number]: PlayerState };
  player_list: Player[];
  top_card: CardIF;
}
