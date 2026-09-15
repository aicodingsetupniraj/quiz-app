// The one place the app reads quiz content. Imported at build time - no fetch, no API route
// (R-5.1.5). The file stays in docs/ until open question Q-5 decides where it lives; importing
// it in place avoids a second copy that would drift.
import raw from "../../docs/topics-data.json";
import { parseContent } from "./parse";

const content = parseContent(raw);

/** Content schema version of topics-data.json. Not the localStorage progress version. */
export const contentVersion = content.version;
export const quizConfig = content.quizConfig;
export const topics = content.topics;
export const badges = content.badges;

export type { Badge, Content, Difficulty, Question, QuizConfig, Topic } from "./types";
