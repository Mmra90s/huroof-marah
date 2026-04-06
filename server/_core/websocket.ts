import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { GameState, Player } from "../../shared/types";

export interface ServerToClientEvents {
  "game:state-update": (state: GameState) => void;
  "game:player-joined": (player: Player) => void;
  "game:player-left": (playerId: number) => void;
  "game:buzzer-pressed": (playerId: number, playerName: string) => void;
  "game:cell-claimed": (cellIndex: number, team: "team1" | "team2") => void;
  "game:round-ended": (winner: "team1" | "team2" | null) => void;
  "game:game-ended": (winner: "team1" | "team2") => void;
}

export interface ClientToServerEvents {
  "game:join-room": (roomCode: string, playerId: number, playerName: string) => void;
  "game:buzzer": (roomCode: string, playerId: number) => void;
  "game:claim-cell": (roomCode: string, cellIndex: number, team: "team1" | "team2") => void;
  "game:next-round": (roomCode: string) => void;
  "game:end-game": (roomCode: string) => void;
}

const rooms: Map<string, Set<string>> = new Map();
const gameStates: Map<string, GameState> = new Map();

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`[WebSocket] New connection: ${socket.id}`);

    socket.on("game:join-room", (roomCode, playerId, playerName) => {
      socket.join(roomCode);

      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, new Set());
      }
      rooms.get(roomCode)!.add(socket.id);

      console.log(`[WebSocket] Player ${playerName} joined room ${roomCode}`);

      // Notify all players in the room
      io.to(roomCode).emit("game:player-joined", {
        id: playerId,
        roomId: 0,
        name: playerName,
        userId: null,
        team: "team1",
        isHost: false,
        joinedAt: new Date(),
      });
    });

    socket.on("game:buzzer", (roomCode, playerId) => {
      console.log(`[WebSocket] Buzzer pressed in room ${roomCode} by player ${playerId}`);
      io.to(roomCode).emit("game:buzzer-pressed", playerId, "");
    });

    socket.on("game:claim-cell", (roomCode, cellIndex, team) => {
      console.log(`[WebSocket] Cell ${cellIndex} claimed by ${team} in room ${roomCode}`);
      io.to(roomCode).emit("game:cell-claimed", cellIndex, team);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Disconnected: ${socket.id}`);

      // Remove from all rooms
      rooms.forEach((sockets, roomCode) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          io.to(roomCode).emit("game:player-left", 0);
        }
      });
    });
  });

  return io;
}
