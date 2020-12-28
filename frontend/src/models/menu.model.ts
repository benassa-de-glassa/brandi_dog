import { Player } from "./player.model";

export interface MenuProps {
  player: Player | null;
  joinGame: (gameID: string) => Promise<void>;
  joinedGame: string | null;
  joinGameSocket: (gameToken: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  closeMenu: () => void;
}

export interface GameViewerProps {
  player: Player | null;
  joinGame: (gameID: string) => Promise<void>;
  joinedGame: string | null;
  joinGameSocket: (gameToken: string) => Promise<void>;
  leaveGame: () => Promise<void>;
}

export interface GlobalChatProps {
  player: Player | null;
}
