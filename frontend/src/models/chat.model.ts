import { Player } from "./player.model";

export interface Message {
  // message_id: string;
  sender: string;
  time: string;
  text: string;
  game_id: string;
}

export interface ChatProps {
  player: Player;
  gameID: string;
}

export interface ChatState {
  textValue: string;
  messages: Message[];
}
