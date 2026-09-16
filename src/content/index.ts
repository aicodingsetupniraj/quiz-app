// The one place the app reads quiz content. Imported at build time - no fetch, no API route
// (R-5.1.5). The file stays in docs/ until open question Q-5 decides where it lives; importing
// it in place avoids a second copy that would drift.
import raw from "../../docs/topics-data.json";
import { parseContent } from "./parse";
import type { Topic } from "./types";

const content = parseContent(raw);

/** Content schema version of topics-data.json. Not the localStorage progress version. */
export const contentVersion = content.version;
export const quizConfig = content.quizConfig;
export const topics = content.topics;
export const badges = content.badges;

/** The topic with exactly this id, or undefined. Compares ids, so "__proto__" and friends can't match. */
export function getTopic(id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id);
}

export type { Badge, Content, Difficulty, Question, QuizConfig, Topic } from "./types";
