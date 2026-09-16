import { describe, expect, it } from "vitest";
import { badges, contentVersion, getTopic, quizConfig, topics } from "./index";

// Checks the real docs/topics-data.json. A content edit that breaks any of these fails CI.

const allQuestions = topics.flatMap((topic) => topic.questions.map((q) => ({ topic: topic.id, q })));

describe("content module", () => {
  it("exposes plain synchronous values, not promises", () => {
    expect(Array.isArray(topics)).toBe(true);
    expect(Array.isArray(badges)).toBe(true);
    expect(typeof quizConfig.questionsPerAttempt).toBe("number");
    expect(typeof contentVersion).toBe("number");
  });

  it("has the six PRD topics", () => {
    expect(topics.map((t) => t.id)).toEqual([
      "space",
      "animals",
      "human-body",
      "plants",
      "weather",
      "simple-machines",
    ]);
  });

  it("has unique topic ids, since they key the grid and form /topics/<id> links", () => {
    const ids = topics.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no repeated question id across all topics", () => {
    const ids = allQuestions.map(({ q }) => q.id);
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(repeated).toEqual([]);
  });
});

describe.each(topics.map((t) => [t.id, t] as const))("topic %s", (_id, topic) => {
  it(`has exactly questionsPerTopic (${quizConfig.questionsPerTopic}) questions`, () => {
    expect(topic.questions).toHaveLength(quizConfig.questionsPerTopic);
  });

  it.each(topic.questions.map((q) => [q.id, q] as const))("question %s is well-formed", (_qid, q) => {
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(q.options.length);
    expect(q.explanation.trim()).not.toBe("");
  });
});

describe("getTopic", () => {
  it("returns the topic with that id", () => {
    expect(getTopic("space")?.title).toBe("Space");
    expect(getTopic("simple-machines")?.id).toBe("simple-machines");
  });

  it.each(["not-a-topic", "", "Space", "constructor", "__proto__"])(
    "returns undefined for %j",
    (id) => {
      expect(getTopic(id)).toBeUndefined();
    },
  );
});
