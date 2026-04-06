import { eq } from "drizzle-orm";
import { gameStates, players, questions, rooms } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Game-related database helpers
export async function createRoom(data: {
  code: string;
  hostId: number;
  hostName: string;
  gridSize: "5x5" | "4x4" | "3x3";
  gameMode: "grid_buzzer" | "buzzer_only" | "grid_only";
  rounds: number;
  winRounds: number;
  team1Name: string;
  team1Color: string;
  team2Name: string;
  team2Color: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rooms).values(data);
  return result;
}

export async function getRoomByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addPlayerToRoom(data: {
  roomId: number;
  userId?: number;
  name: string;
  team: "team1" | "team2";
  isHost: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(players).values(data);
  return result;
}

export async function getRoomPlayers(roomId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(players).where(eq(players.roomId, roomId));
}

export async function addQuestion(data: {
  roomId: number;
  question: string;
  answer: string;
  category: string;
  difficulty: "سهل" | "متوسط" | "صعب";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(questions).values(data);
  return result;
}

export async function getRoomQuestions(roomId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(questions).where(eq(questions.roomId, roomId));
}

export async function createGameState(data: {
  roomId: number;
  gridLetters: string;
  gridOwners: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gameStates).values(data);
  return result;
}

export async function getGameState(roomId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(gameStates).where(eq(gameStates.roomId, roomId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Question management functions
export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateQuestion(id: number, data: {
  question?: string;
  answer?: string;
  category?: string;
  difficulty?: "سهل" | "متوسط" | "صعب";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  if (data.question !== undefined) updateData.question = data.question;
  if (data.answer !== undefined) updateData.answer = data.answer;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields to update");
  }

  await db.update(questions).set(updateData).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(questions).where(eq(questions.id, id));
}

export async function getQuestionsByCategory(roomId: number, category: string) {
  const db = await getDb();
  if (!db) return [];

  if (category === "الكل") {
    return await db.select().from(questions).where(eq(questions.roomId, roomId));
  }

  return await db.select().from(questions)
    .where(eq(questions.roomId, roomId) && eq(questions.category, category));
}

export async function getQuestionsByDifficulty(roomId: number, difficulty: "سهل" | "متوسط" | "صعب") {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(questions)
    .where(eq(questions.roomId, roomId) && eq(questions.difficulty, difficulty));
}
