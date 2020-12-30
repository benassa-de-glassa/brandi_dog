import { ActionNumber} from "./action.model";
import { BoardCoordinates } from "./board.model";

export interface Tooltip {
  anchor: BoardCoordinates;
  x: string;
  y: string;
}

export interface TooltipProps {
  tooltip: Tooltip;
  tooltipActions: ActionNumber[];
  tooltipClicked: (action: ActionNumber) => void;
  tooltipVisible: boolean;
  closeTooltip: () => void;
}
