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
  _2 = "_2",
  _3 = "_3",
  _4 = "_4",
  _5 = "_5",
  _6 = "_6",
  _7 = "_7",
  _8 = "_8",
  _9 = "_9",
  _10 = "_10",
  Ja = "Ja",
  Q = "Q",
  K = "K",
  Jo = "Jo",
}

/*
Avoid name clash with the Card react component
*/
export interface CardBaseIF {
  value: keyof typeof CardKey;
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
