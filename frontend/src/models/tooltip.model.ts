import { Position } from "./board.model";

export interface Tooltip {
  anchor: Position;
  x: string;
  y: string;
}

export interface TooltipProps {
  tooltip: Tooltip;
  tooltipActions: number[];
  tooltipClicked: (action: number | string) => {};
  closeTooltip: () => void;
}
