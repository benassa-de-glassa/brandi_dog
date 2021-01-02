export interface Player {
  username: string;
  uid: number;
  avatar: string;
}

export interface PlayerInGame extends Player { 
  playerHasFinished: boolean;
  
}