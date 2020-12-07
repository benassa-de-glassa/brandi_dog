export interface UserLoginProps {
  playerLoggedIn: boolean;
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
