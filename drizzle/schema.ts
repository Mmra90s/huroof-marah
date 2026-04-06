import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Game-related tables
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(), // Room code (e.g., "ABCD12")
  hostId: int("hostId").notNull().references(() => users.id),
  hostName: varchar("hostName", { length: 255 }).notNull(), // Customizable host name (مراح)
  gridSize: mysqlEnum("gridSize", ["5x5", "4x4", "3x3"]).default("5x5").notNull(),
  gameMode: mysqlEnum("gameMode", ["grid_buzzer", "buzzer_only", "grid_only"]).default("grid_buzzer").notNull(),
  rounds: int("rounds").default(1).notNull(),
  status: mysqlEnum("status", ["waiting", "playing", "finished"]).default("waiting").notNull(),
  team1Name: varchar("team1Name", { length: 255 }).default("الفريق الأول").notNull(),
  team1Color: varchar("team1Color", { length: 7 }).default("#22c55e").notNull(), // Green
  team2Name: varchar("team2Name", { length: 255 }).default("الفريق الثاني").notNull(),
  team2Color: varchar("team2Color", { length: 7 }).default("#f97316").notNull(), // Orange
  currentRound: int("currentRound").default(1).notNull(),
  team1Score: int("team1Score").default(0).notNull(),
  team2Score: int("team2Score").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  team: mysqlEnum("team", ["team1", "team2"]).notNull(),
  isHost: boolean("isHost").default(false).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 255 }).default("عام").notNull(),
  difficulty: mysqlEnum("difficulty", ["سهل", "متوسط", "صعب"]).default("متوسط").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const gameStates = mysqlTable("gameStates", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull().unique().references(() => rooms.id, { onDelete: "cascade" }),
  gridLetters: text("gridLetters").notNull(), // JSON array of letters
  gridOwners: text("gridOwners").notNull(), // JSON array: null | "team1" | "team2"
  currentQuestionId: int("currentQuestionId").references(() => questions.id),
  buzzedPlayerId: int("buzzedPlayerId").references(() => players.id),
  buzzedAt: timestamp("buzzedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = typeof gameStates.$inferInsert;