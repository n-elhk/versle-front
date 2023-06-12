import { Answer, BoardStore } from './board';

export type GameStorage = Pick<BoardStore, 'attempts' | 'board' | 'currentRow'>;

export type VersleState =  {
  answer: Answer;
  versle: Versle;
  gameState: GameStorage;
};

export interface Versle {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}
