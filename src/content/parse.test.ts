import { describe, expect, it } from "vitest";
import { ContentError, parseContent } from "./parse";

function validContent() {
  return {
    version: 2,
    quizConfig: { questionsPerTopic: 1, questionsPerAttempt: 1, selectionMethod: "random" },
    topics: [
      {
        id: "space",
        title: "Space",
        icon: "🚀",
        difficulty: "Easy",
        description: "Planets and stars",
        funFacts: ["The Sun is a star."],
        questions: [
          {
            id: "space-1",
            question: "Which planet is red?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctIndex: 1,
            explanation: "Rust.",
          },
        ],
      },
    ],
    badges: [{ id: "first-quiz", name: "First Steps", icon: "⭐", criteria: "Finish one." }],
  };
}

describe("parseContent", () => {
  it("accepts well-formed content", () => {
    const content = parseContent(validContent());
    expect(content.topics[0].difficulty).toBe("Easy");
    expect(content.quizConfig.questionsPerAttempt).toBe(1);
  });

  it("rejects a root that is not an object", () => {
    expect(() => parseContent([])).toThrow(ContentError);
  });

  it("rejects an unknown difficulty, naming the path", () => {
    const bad = validContent();
    bad.topics[0].difficulty = "Expert";
    expect(() => parseContent(bad)).toThrow(/topics\[0\]\.difficulty: expected Easy\|Medium\|Hard/);
  });

  it("rejects a non-integer correctIndex", () => {
    const bad = validContent();
    bad.topics[0].questions[0].correctIndex = 1.5;
    expect(() => parseContent(bad)).toThrow(/questions\[0\]\.correctIndex: expected an integer/);
  });

  it("rejects options that are not an array", () => {
    const bad = { ...validContent() };
    (bad.topics[0].questions[0] as Record<string, unknown>).options = "Mars";
    expect(() => parseContent(bad)).toThrow(/questions\[0\]\.options: expected an array/);
  });

  it("rejects a missing explanation", () => {
    const bad = validContent();
    delete (bad.topics[0].questions[0] as Record<string, unknown>).explanation;
    expect(() => parseContent(bad)).toThrow(/questions\[0\]\.explanation: expected a non-empty string/);
  });
});
