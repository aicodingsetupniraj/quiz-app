export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Question = {
  readonly id: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
};

export type Topic = {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly difficulty: Difficulty;
  readonly description: string;
  readonly funFacts: readonly string[];
  readonly questions: readonly Question[];
};

export type Badge = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly criteria: string;
};

export type QuizConfig = {
  readonly questionsPerTopic: number;
  readonly questionsPerAttempt: number;
  readonly selectionMethod: string;
};

export type Content = {
  readonly version: number;
  readonly quizConfig: QuizConfig;
  readonly topics: readonly Topic[];
  readonly badges: readonly Badge[];
};
