import {
  DIFFICULTIES,
  type Badge,
  type Content,
  type Difficulty,
  type Question,
  type QuizConfig,
  type Topic,
} from "./types";

// A JSON import is typed loosely (difficulty: string, correctIndex: number), so the content
// is checked once, here, instead of cast. A malformed edit fails `next build` with the path
// of the bad value rather than rendering something wrong.

export class ContentError extends Error {
  constructor(path: string, message: string) {
    super(`topics-data.json ${path}: ${message}`);
    this.name = "ContentError";
  }
}

type Obj = Record<string, unknown>;

function object(value: unknown, path: string): Obj {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContentError(path, "expected an object");
  }
  return value as Obj;
}

function string(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContentError(path, "expected a non-empty string");
  }
  return value;
}

function integer(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ContentError(path, `expected an integer, got ${JSON.stringify(value)}`);
  }
  return value;
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new ContentError(path, "expected an array");
  return value;
}

function difficulty(value: unknown, path: string): Difficulty {
  const found = DIFFICULTIES.find((d) => d === value);
  if (!found) {
    throw new ContentError(path, `expected ${DIFFICULTIES.join("|")}, got ${JSON.stringify(value)}`);
  }
  return found;
}

function parseQuestion(value: unknown, path: string): Question {
  const q = object(value, path);
  return {
    id: string(q.id, `${path}.id`),
    question: string(q.question, `${path}.question`),
    options: array(q.options, `${path}.options`).map((o, i) => string(o, `${path}.options[${i}]`)),
    correctIndex: integer(q.correctIndex, `${path}.correctIndex`),
    explanation: string(q.explanation, `${path}.explanation`),
  };
}

function parseTopic(value: unknown, path: string): Topic {
  const t = object(value, path);
  return {
    id: string(t.id, `${path}.id`),
    title: string(t.title, `${path}.title`),
    icon: string(t.icon, `${path}.icon`),
    difficulty: difficulty(t.difficulty, `${path}.difficulty`),
    description: string(t.description, `${path}.description`),
    funFacts: array(t.funFacts, `${path}.funFacts`).map((f, i) => string(f, `${path}.funFacts[${i}]`)),
    questions: array(t.questions, `${path}.questions`).map((q, i) =>
      parseQuestion(q, `${path}.questions[${i}]`),
    ),
  };
}

function parseBadge(value: unknown, path: string): Badge {
  const b = object(value, path);
  return {
    id: string(b.id, `${path}.id`),
    name: string(b.name, `${path}.name`),
    icon: string(b.icon, `${path}.icon`),
    criteria: string(b.criteria, `${path}.criteria`),
  };
}

function parseQuizConfig(value: unknown, path: string): QuizConfig {
  const c = object(value, path);
  return {
    questionsPerTopic: integer(c.questionsPerTopic, `${path}.questionsPerTopic`),
    questionsPerAttempt: integer(c.questionsPerAttempt, `${path}.questionsPerAttempt`),
    selectionMethod: string(c.selectionMethod, `${path}.selectionMethod`),
  };
}

/** Checks the shape of the content file. Counts and cross-topic rules live in content.test.ts. */
export function parseContent(raw: unknown): Content {
  const root = object(raw, "(root)");
  return {
    version: integer(root.version, "version"),
    quizConfig: parseQuizConfig(root.quizConfig, "quizConfig"),
    topics: array(root.topics, "topics").map((t, i) => parseTopic(t, `topics[${i}]`)),
    badges: array(root.badges, "badges").map((b, i) => parseBadge(b, `badges[${i}]`)),
  };
}
