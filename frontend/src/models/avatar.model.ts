export interface AvatarProps {
  className: string;
  clickHandler: () => void;
  isMe: boolean;
  playerName: string;
  isHost?: boolean;
  isActive: boolean;
  image: string;
  textOnTop: boolean;
}
