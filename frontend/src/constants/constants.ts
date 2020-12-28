import { Action } from "../models/action.model";
import { CardKey } from "../models/card.model";

// Export the API and socket URLs. The environment variable NODE_ENV is
// automatically set to 'production', 'test', or 'deployment'. For 'production' 
// the URLs are read from environment variables which are added on heroku. 

export const API_URL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : "http://localhost:8000/v1/"
export const SIO_URL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_SIO_URL : "http://localhost:8000" 

export const possibleActions: { [key in CardKey]: Action[] } = {
  A: [0, 1, 11],
  _2: [2],
  _3: [3],
  _4: [-4, 4],
  _5: [5],
  _6: [6],
  _7: [71, 72, 73, 74, 75, 76, 77],
  _8: [8],
  _9: [9],
  _10: [10],
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
