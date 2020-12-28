import { Player } from "./player.model";

export interface GlobalMessage {
  message_id: number;
  sender: string;
  time: string;
  text: string;
}

export interface Message extends GlobalMessage {
  game_id: string;
}

export interface ChatProps {
  player: Player | null;
  gameID: string;
}

export interface ChatState {
  textValue: string;
  messages: Message[];
}
