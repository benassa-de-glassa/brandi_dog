import { Action } from "../models/action.model";
import { CardKey } from "../models/card.model";

// defaults to run locally, in case the environment variables don't specify 
// different URLs
export const API_URL: string = "http://localhost:8000/v1/";
export const SIO_URL: string = "http://localhost:8000";

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
  