import { Player } from "./player.model";

export interface TopBarProps {
  socketConnected: boolean;
  location: any;
  player: Player | null;
  showMenu: boolean;
  toggleMenu: () => void;
  logout: () => void;
  clearSocket: () => void;
}
