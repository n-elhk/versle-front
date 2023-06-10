import { Answer, Board } from "./board";

export interface VersleState {
  answer: Answer;
  board: Board;
  versle: Versle;
}

export interface Versle {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}
