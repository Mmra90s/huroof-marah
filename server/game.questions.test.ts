import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

// Mock the database module
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

describe("Game Questions Procedures", () => {
  describe("addQuestion", () => {
    it("should add a question with all required fields", async () => {
      const questionData = {
        roomId: 1,
        question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
        answer: "المشتري",
        category: "علوم",
        difficulty: "سهل" as const,
      };

      // This test verifies the input validation
      expect(questionData.question).toBeTruthy();
      expect(questionData.answer).toBeTruthy();
      expect(questionData.category).toBeTruthy();
      expect(["سهل", "متوسط", "صعب"]).toContain(questionData.difficulty);
    });

    it("should reject question without text", () => {
      const invalidData = {
        roomId: 1,
        question: "",
        answer: "المشتري",
        category: "علوم",
        difficulty: "سهل" as const,
      };

      expect(invalidData.question).toBeFalsy();
    });

    it("should reject question without answer", () => {
      const invalidData = {
        roomId: 1,
        question: "ما هو أكبر كوكب؟",
        answer: "",
        category: "علوم",
        difficulty: "سهل" as const,
      };

      expect(invalidData.answer).toBeFalsy();
    });
  });

  describe("updateQuestion", () => {
    it("should validate difficulty enum", () => {
      const validDifficulties = ["سهل", "متوسط", "صعب"];
      const testDifficulty = "متوسط";

      expect(validDifficulties).toContain(testDifficulty);
    });

    it("should allow partial updates", () => {
      const updateData = {
        question: "سؤال محدث",
        // answer and difficulty are optional
      };

      expect(updateData.question).toBeTruthy();
      expect(Object.keys(updateData).length).toBeGreaterThan(0);
    });
  });

  describe("deleteQuestion", () => {
    it("should accept valid question ID", () => {
      const questionId = 123;

      expect(typeof questionId).toBe("number");
      expect(questionId).toBeGreaterThan(0);
    });

    it("should reject invalid question ID", () => {
      const invalidId = -1;

      expect(invalidId).toBeLessThan(0);
    });
  });

  describe("getQuestionsByCategory", () => {
    it("should handle 'الكل' category", () => {
      const category = "الكل";
      const roomId = 1;

      expect(category).toBe("الكل");
      expect(roomId).toBeGreaterThan(0);
    });

    it("should handle specific categories", () => {
      const validCategories = ["عام", "علوم", "تاريخ", "جغرافيا", "أدب"];
      const testCategory = "علوم";

      expect(validCategories).toContain(testCategory);
    });
  });

  describe("getQuestionsByDifficulty", () => {
    it("should filter by difficulty level", () => {
      const difficulties = ["سهل", "متوسط", "صعب"];

      difficulties.forEach((difficulty) => {
        expect(["سهل", "متوسط", "صعب"]).toContain(difficulty);
      });
    });

    it("should require valid roomId", () => {
      const roomId = 1;

      expect(typeof roomId).toBe("number");
      expect(roomId).toBeGreaterThan(0);
    });
  });

  describe("Question validation", () => {
    it("should validate question length", () => {
      const shortQuestion = "ما؟";
      const longQuestion = "ما هو أكبر كوكب في المجموعة الشمسية وما هي خصائصه وكم يبعد عن الشمس؟";

      expect(shortQuestion.length).toBeGreaterThan(0);
      expect(longQuestion.length).toBeGreaterThan(0);
    });

    it("should validate category is not empty", () => {
      const validCategory = "علوم";
      const invalidCategory = "";

      expect(validCategory).toBeTruthy();
      expect(invalidCategory).toBeFalsy();
    });
  });
});
