import { ActionNumber } from "./action.model";
import { CardIF } from "./card.model";
import { Marble } from "./marble.model";
import { Player } from "./player.model";
import { Tooltip } from "./tooltip.model";
import { Move } from './action.model'

export interface BoardProps {
  numberOfPlayers: 4 | 6;
  player: Player | null;
  playerList: Player[];
  marbles: {[key: number]: Marble};
  selectedCard: CardIF | null; 
  selectedMarble: Marble | null;
  marbleToSwitch: Marble | null;
  marbleClicked: (marble: Marble, homeClicked: boolean) => void;
  tooltipActions: ActionNumber[] // tooltip only has to display "number moves", i.e. no "switch"
  setNewPosition: (index: number) => Promise<void>;
  switchingSeats: boolean;
  activePlayerIndex: number | null;
  tooltipClicked: (action: ActionNumber) => void;
  tooltipVisible: boolean;
  showTooltip: (b: boolean) => void;

  topCard: CardIF | null;
  moves: Move[];
}

export interface BoardData {
  steps: Step[],
  outer: BoardCoordinates[],
  homes: Step[],
  houses: Step[],
}

export interface BoardTooltipState extends Tooltip {
  stepPosition: number | null;
  visible: boolean;
  text: string;
}

export interface BoardCoordinates {
  x: number;
  y: number;
  color?: string;
};

export interface Step extends BoardCoordinates {
  id: number;
  color?: string;
}

export interface BoardPositions {
  steps: Step[];
  outer: BoardCoordinates[];
  homes: Step[];
  houses: Step[];
}

