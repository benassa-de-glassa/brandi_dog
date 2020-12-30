import { Action } from "../models/action.model";
import { CardValue } from "../models/card.model";

// Export the API and socket URLs. The environment variable NODE_ENV is
// automatically set to 'production', 'test', or 'deployment'. For 'production'
// the URLs are read from environment variables which are added on heroku.

export const API_URL =
  process.env.NODE_ENV === "production"
    ? (process.env.REACT_APP_API_URL as string)
    : "http://localhost:8000/v1/";
export const SIO_URL =
  process.env.NODE_ENV === "production"
    ? (process.env.REACT_APP_SIO_URL as string)
    : "http://localhost:8000";

export const possibleActions: { [key in CardValue]: Action[] } = {
  A: [0, 1, 11],
  "2": [2],
  "3": [3],
  "4": [-4, 4],
  "5": [5],
  "6": [6],
  "7": [71, 72, 73, 74, 75, 76, 77],
  "8": [8],
  "9": [9],
  "10": [10],
  Ja: ["switch"],
  Q: [12],
  K: [0, 13],
  Jo: [], // has to be included due to reasons, should never be accessed
};

export const avatarPath = "/users/avatars";

export const avatars = [
  "ara",
  "arctic-fox",
  "cat",
  "dolphin",
  "eagle",
  "fox",
  "frog",
  "hedgehog",
  "lama",
  "otter",
  "panda",
  "parrot",
  "penguin",
  "seal",
  "squirrel",
  "swan",
  "tiger",
];
