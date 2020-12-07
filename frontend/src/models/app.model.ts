import { Player } from "./player.model";

export interface MainAppProps {}

export interface MainAppState {
  showMenu: boolean;
  playerLoggedIn: boolean;
  player: Player;
  gameID: string | null;
  socketConnected: boolean;
  errorMessage: string;
  gameToken: string;
}
