export interface ResponseData {
  detail?: any;
  code?: number;
  message?: string;
}

export interface GetPlayerResponse extends ResponseData{
  username: string;
  avatar: string;
  uid: number;
  current_game?: string;
  game_token?: string;
}
