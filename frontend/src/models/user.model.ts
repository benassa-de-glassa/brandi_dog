import { Player } from "./player.model";

export interface UserLoginProps {
  player: Player | null;
  login: (
    username: string,
    password: string,
    errorCallback: (message: string) => void
  ) => void;
}

export interface UserCreateProps {
  createUser: (
    username: string,
    password: string,
    avatar: string,
    setStateCallBack: () => void,
    errorCallback: (message: string) => void
  ) => void;
}

export interface UserCreateState {
  username: string;
  password: string;
  success: boolean;
  error: string;
}

export interface UserSettingsProps {
  player: Player;
}