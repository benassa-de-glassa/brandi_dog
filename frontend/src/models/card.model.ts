import { Action } from "./action.model";

export enum Colors {
  spades = "spades",
  hearts = "hearts",
  diamonds = "diamonds",
  clubs = "clubs",
}

export const colorToUnicode: { [key in Colors]: string } = {
  // these are the unicode symbols
  spades: "\u2660",
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
};

export enum CardKey {
  A = "A",
  _2 = "2",
  _3 = "3",
  _4 = "4",
  _5 = "5",
  _6 = "6",
  _7 = "7",
  _8 = "8",
  _9 = "9",
  _10 = "10",
  Ja = "Ja",
  Q = "Q",
  K = "K",
  Jo = "Jo",
}

export type CardValue =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Ja"
  | "Q"
  | "K"
  | "Jo";

/*
Avoid name clash with the Card react component
*/
export interface CardBaseIF {
  value: CardValue;
  color: keyof typeof Colors;
}

export interface CardIF extends CardBaseIF {
  uid: number;
  actions: Action[];
}

export interface CardProps extends CardBaseIF {
  selected?: boolean;
  highlighted?: boolean;
  clickHandler?: () => void;
}
