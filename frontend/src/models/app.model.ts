import { Player } from "./player.model";

export interface MainAppProps {}

export interface MainAppState {
  showMenu: boolean;
  player: Player | null;
  gameID: string | null;
  socketConnected: boolean;
  errorMessage: string;
  gameToken: string;
}
