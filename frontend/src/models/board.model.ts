import { Card } from "./card.model";
import { Marble } from "./marble.model";
import { Player } from "./player.model";
import { Tooltip } from "./tooltip.model";

export interface BoardProps {
  player: Player;
  playerList: Player[];
  marbleList: Marble[];
  marbleClicked: (marble: Marble, homeClicked: boolean) => {};
  tooltipActions: number[];
  setNewPosition: (index: number) => Promise<void>;
  switchingSeats: boolean;
  activePlayerIndex: number;
  tooltipClicked: (action: number | string) => {};

  topCard: Card;
}

export interface BoardTooltipState extends Tooltip {
  visible: boolean;
  text: string;
}

export interface Position {
  x: string;
  y: string;
  id: number;
  color?: string;
}

export interface BoardPositions {
  steps: Position[];
  outer: Position[];
  homes: Position[];
  houses: Position[];
}
