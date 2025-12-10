export enum Player {
  USER = 'USER',
  AI = 'AI'
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface GameState {
  scores: Record<Player, number>;
  currentTurnScore: number;
  activePlayer: Player;
  status: GameStatus;
  winner: Player | null;
  lastRoll: number;
}

export interface AIDecision {
  action: 'roll' | 'hold';
  reasoning: string;
}
