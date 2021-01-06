import { Player } from "./player.model";

export type ActionNumber =
  | 0 // go out
  | 1 // move 1
  | 2 // ...
  | 3
  | 4
  | -4 // move 4 backwards
  | 5
  | 6
  | 7
  | 71 // move 1 using a seven card
  | 72 // ...
  | 73
  | 74
  | 75
  | 76
  | 77 // move 7 using a seven card
  | 8 // move 8
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
