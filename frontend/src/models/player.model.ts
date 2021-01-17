export interface Player {
  username: string;
  uid: string;
  avatar: string;
}

export interface PlayerInGame extends Player { 
  playerHasFinished: boolean;
  
}