import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createRoom,
  getRoomByCode,
  addPlayerToRoom,
  getRoomPlayers,
  addQuestion,
  getRoomQuestions,
  createGameState,
  getGameState,
} from "../db";
import { generateRoomCode, getRandomLetters, GRID_SIZES } from "../../shared/types";
import type { GridSize, GameMode } from "../../shared/types";

export const gameRouter = router({
  // Create a new game room
  createRoom: protectedProcedure
    .input(
      z.object({
        hostName: z.string().min(1).max(255),
        gridSize: z.enum(["5x5", "4x4", "3x3"]),
        gameMode: z.enum(["grid_buzzer", "buzzer_only", "grid_only"]),
        rounds: z.number().int().min(1).max(3),
        team1Name: z.string().min(1).max(255),
        team1Color: z.string().regex(/^#[0-9A-F]{6}$/i),
        team2Name: z.string().min(1).max(255),
        team2Color: z.string().regex(/^#[0-9A-F]{6}$/i),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = generateRoomCode();

      await createRoom({
        code,
        hostId: ctx.user.id,
        hostName: input.hostName,
        gridSize: input.gridSize as GridSize,
        gameMode: input.gameMode as GameMode,
        rounds: input.rounds,
        team1Name: input.team1Name,
        team1Color: input.team1Color,
        team2Name: input.team2Name,
        team2Color: input.team2Color,
      });

      // Get the created room ID
      const room = await getRoomByCode(code);
      if (!room) throw new Error("Failed to create room");

      // Initialize game state with random letters
      const gridSize = GRID_SIZES[input.gridSize as GridSize];
      const letters = getRandomLetters(gridSize);
      const owners = new Array(gridSize).fill(null);

      await createGameState({
        roomId: room.id,
        gridLetters: JSON.stringify(letters),
        gridOwners: JSON.stringify(owners),
      });

      // Add host as player
      await addPlayerToRoom({
        roomId: room.id,
        userId: ctx.user.id,
        name: input.hostName,
        team: "team1",
        isHost: true,
      });

      return {
        roomId: room.id,
        code: room.code,
        hostName: room.hostName,
      };
    }),

  // Join an existing room
  joinRoom: publicProcedure
    .input(
      z.object({
        code: z.string().length(6),
        playerName: z.string().min(1).max(255),
        team: z.enum(["team1", "team2"]),
      })
    )
    .mutation(async ({ input }) => {
      const room = await getRoomByCode(input.code);
      if (!room) throw new Error("غرفة غير موجودة");

      const players = await getRoomPlayers(room.id);
      if (players.length >= 9) throw new Error("الغرفة ممتلئة");

      const result = await addPlayerToRoom({
        roomId: room.id,
        name: input.playerName,
        team: input.team,
        isHost: false,
      });

      return {
        roomId: room.id,
        playerId: (result as any).insertId,
        playerName: input.playerName,
      };
    }),

  // Get room details
  getRoom: publicProcedure
    .input(z.object({ code: z.string().length(6) }))
    .query(async ({ input }) => {
      const room = await getRoomByCode(input.code);
      if (!room) throw new Error("غرفة غير موجودة");

      const players = await getRoomPlayers(room.id);
      const gameState = await getGameState(room.id);

      return {
        id: room.id,
        code: room.code,
        hostName: room.hostName,
        gridSize: room.gridSize,
        gameMode: room.gameMode,
        rounds: room.rounds,
        status: room.status,
        team1Name: room.team1Name,
        team1Color: room.team1Color,
        team2Name: room.team2Name,
        team2Color: room.team2Color,
        currentRound: room.currentRound,
        team1Score: room.team1Score,
        team2Score: room.team2Score,
        players,
        gameState: gameState
          ? {
              gridLetters: JSON.parse(gameState.gridLetters),
              gridOwners: JSON.parse(gameState.gridOwners),
              currentQuestionId: gameState.currentQuestionId,
              buzzedPlayerId: gameState.buzzedPlayerId,
              buzzedAt: gameState.buzzedAt,
            }
          : null,
      };
    }),

  // Add a question to the room
  addQuestion: protectedProcedure
    .input(
      z.object({
        roomId: z.number().int(),
        question: z.string().min(1),
        answer: z.string().min(1),
        category: z.string().min(1),
        difficulty: z.enum(["سهل", "متوسط", "صعب"]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await addQuestion(input);
      return result;
    }),

  // Get room questions
  getRoomQuestions: publicProcedure
    .input(z.object({ roomId: z.number().int() }))
    .query(async ({ input }) => {
      const questions = await getRoomQuestions(input.roomId);
      return questions;
    }),
});
