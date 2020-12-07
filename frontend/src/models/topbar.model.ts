import { Player } from "./player.model";

export interface TopBarProps {
  socketConnected: boolean;
  playerLoggedIn: boolean;
  location: any;
  player: Player;
  showMenu: boolean;
  toggleMenu: () => void;
  logout: () => void;
  clearSocket: () => void;
}
