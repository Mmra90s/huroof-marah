/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Game types and constants
export type GridSize = "5x5" | "4x4" | "3x3";
export type GameMode = "grid_buzzer" | "buzzer_only" | "grid_only";
export type Team = "team1" | "team2";
export type Difficulty = "سهل" | "متوسط" | "صعب";
export type RoomStatus = "waiting" | "playing" | "finished";

export const GRID_SIZES: Record<GridSize, number> = {
  "5x5": 25,
  "4x4": 16,
  "3x3": 9,
};

export const ARABIC_LETTERS = [
  "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
  "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
  "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
];

export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getRandomLetters(count: number): string[] {
  const letters = [];
  for (let i = 0; i < count; i++) {
    letters.push(ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)]);
  }
  return letters;
}

export interface HexagonalGridCoord {
  q: number;
  r: number;
}

export interface GridCell {
  id: number;
  letter: string;
  owner: Team | null;
  coord: HexagonalGridCoord;
}

export interface RoomSettings {
  gridSize: GridSize;
  gameMode: GameMode;
  rounds: number;
  team1Name: string;
  team1Color: string;
  team2Name: string;
  team2Color: string;
}

export interface GameRoomData {
  id: number;
  code: string;
  hostName: string;
  settings: RoomSettings;
  status: RoomStatus;
  currentRound: number;
  team1Score: number;
  team2Score: number;
  players: PlayerData[];
  gameState: GameStateData;
}

export interface PlayerData {
  id: number;
  name: string;
  team: Team;
  isHost: boolean;
}

export interface GameStateData {
  gridLetters: string[];
  gridOwners: (Team | null)[];
  currentQuestionId: number | null;
  buzzedPlayerId: number | null;
  buzzedAt: Date | null;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: Difficulty;
}
