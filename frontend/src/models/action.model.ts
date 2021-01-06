import { Player } from "./player.model";

export type ActionNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | -4
  | 5
  | 6
  | 7
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;

export type Action = ActionNumber | "switch";

export interface Move {
  action: Action;
  player: Player;
  positions: { old: number; new: number };
}
