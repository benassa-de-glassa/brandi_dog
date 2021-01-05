import { ActionNumber} from "./action.model";

export interface Tooltip {
  anchor: {x: "left" | "right", y: "top" | "bottom"};
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
