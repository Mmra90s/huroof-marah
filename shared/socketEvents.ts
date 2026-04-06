// Socket.io event types for real-time synchronization

export interface SocketEvents {
  // Room events
  "room:created": { code: string; hostName: string };
  "room:joined": { playerId: number; playerName: string; team: string };
  "room:left": { playerId: number };
  "room:updated": { status: string; currentRound: number };

  // Player events
  "player:buzzed": { playerId: number; playerName: string; timestamp: number };
  "player:reset": void;

  // Game state events
  "game:started": { gridLetters: string[] };
  "game:cellClaimed": { cellIndex: number; team: string };
  "game:gridCleared": { gridLetters: string[] };
  "game:questionSet": { questionId: number; question: string };
  "game:answerRevealed": { answer: string };
  "game:roundEnded": { winner: string };
  "game:pathDetected": { team: string; cells: number[] };

  // Score events
  "score:updated": { team1Score: number; team2Score: number };

  // Notification events
  "notification:send": { message: string; type: "info" | "success" | "error" };
}

export const SOCKET_EVENTS = {
  // Room events
  ROOM_CREATED: "room:created",
  ROOM_JOINED: "room:joined",
  ROOM_LEFT: "room:left",
  ROOM_UPDATED: "room:updated",

  // Player events
  PLAYER_BUZZED: "player:buzzed",
  PLAYER_RESET: "player:reset",

  // Game state events
  GAME_STARTED: "game:started",
  GAME_CELL_CLAIMED: "game:cellClaimed",
  GAME_GRID_CLEARED: "game:gridCleared",
  GAME_QUESTION_SET: "game:questionSet",
  GAME_ANSWER_REVEALED: "game:answerRevealed",
  GAME_ROUND_ENDED: "game:roundEnded",
  GAME_PATH_DETECTED: "game:pathDetected",

  // Score events
  SCORE_UPDATED: "score:updated",

  // Notification events
  NOTIFICATION_SEND: "notification:send",
} as const;
