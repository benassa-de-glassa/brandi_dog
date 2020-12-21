import { Player } from "./player.model";

export interface MenuProps {
  playerLoggedIn: boolean;
  player: Player;
  joinGame: (gameID: string) => Promise<void>;
  joinedGame: string | null;
  joinGameSocket: (gameToken: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  closeMenu: () => void;
}

export interface GameViewerProps {
  playerLoggedIn: boolean;
  player: Player;
  joinGame: (gameID: string) => Promise<void>;
  joinedGame: string | null;
  joinGameSocket: (gameToken: string) => Promise<void>;
  leaveGame: () => Promise<void>;
}

export interface GlobalChatProps {
  playerLoggedIn: boolean;
  player: Player;
}
