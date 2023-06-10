import { Versle } from './versle';

type toto = number | null;

export type Answer = [number, string, string, string, string];

export type Board = [
  [toto, toto, toto, toto, toto],
  [toto, toto, toto, toto, toto],
  [toto, toto, toto, toto, toto],
  [toto, toto, toto, toto, toto],
  [toto, toto, toto, toto, toto],
  [toto, toto, toto, toto, toto]
];

export interface BoardStore {
  attempts: KeyOfAttempt[][];
  board: Board;
  currentRow: number;
  status: string;
  statistics: string;
  answer: Answer;
  versle: Versle | undefined;
}

export enum Attempt {
  correct = 'correct',
  partial = 'partial',
  absent = 'absent',
}

export type KeyOfAttempt = keyof typeof Attempt;

export enum SquareAttempt {
  correct = '🟩',
  partial = '🟧',
  absent = '🟥',
}
