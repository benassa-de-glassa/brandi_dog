export interface AvatarProps {
  numberOfPlayers: number;
  playerIndex: number;
  clickable: boolean;
  clickHandler: () => void;
  isMe: boolean;
  playerName: string;
  isHost?: boolean;
  isActive: boolean;
  image: string;
  textOnTop: boolean;
}
