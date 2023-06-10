import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Attempt, Board, BoardStore, KeyOfAttempt } from '../../models/board';
import { VersleState } from '../../models/versle';

export const DEFAULT_BOARD: Board = [
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];

@Injectable({
  providedIn: 'root',
})
export class BoardService extends ComponentStore<BoardStore> {
  constructor() {
    super({
      attempts: [],
      board: DEFAULT_BOARD,
      currentRow: 0,
      status: 'IN_PROGRESS',
      statistics: 'IN_PROGRESS',
      answer: [0, '0', '0', '0', '0'],
      versle: undefined,
    });
  }

  readonly selectCurrentRow = this.selectSignal(({ currentRow }) => currentRow);

  readonly selectAnswer = this.selectSignal(({ answer }) => answer);

  readonly selectVersle = this.selectSignal(({ versle }) => versle);

  readonly selectAttempts = this.selectSignal(({ attempts }) => attempts);

  readonly selectBoard = this.selectSignal(({ board }) => board);

  readonly lineIsComplete = this.selectSignal(
    ({ board, currentRow }) =>
      board[currentRow].filter((value) => value === null).length === 0
  );

  readonly lineInputIsComplete = this.selectSignal(({ board, currentRow }) => {
    const currentBoard = [...board[currentRow]];
    currentBoard.shift();

    return currentBoard.filter((value) => value === null).length === 0;
  });

  readonly init = this.updater((state, value: VersleState) => {
    return { ...state, ...value };
  });

  readonly chooseNumber = this.updater((state, value: number) => {
    const board = state.board;
    const line = board[state.currentRow];

    const deepCopyLine = line.slice() as typeof line;
    deepCopyLine.shift();

    const index = deepCopyLine.findIndex((v) => v === null);

    /** Because we was remove the first of the copy. */
    line[index + 1] = value;

    return { ...state, ...board };
  });

  readonly deleteLastNumber = this.updater((state) => {
    const board = [...state.board];
    const line = board[state.currentRow];
    const index = this.findLastNaNIndex(line);

    if (index > 0) {
      line[index] = null;
    }
    return { ...state, ...board };
  });

  readonly chooseBook = this.updater((state, value: number) => {
    const board = state.board;
    const line = board[state.currentRow];

    line[0] = value;

    return { ...state, ...board };
  });

  readonly nextLine = this.updater((state) => {
    const board = [...state.board];
    const line = [...board[state.currentRow]];
    const answer = [...state.answer];

    /** Add the first element its a book index. */
    const attempts: KeyOfAttempt[] = [
      line[0] === answer[0] ? Attempt.correct : Attempt.absent,
    ];

    /** Remove the first element its a book index. */
    line.shift();
    answer.shift();

    /** Join for comparaison of the place. */
    const lineStr = line.join('');
    const answerStr = answer.join('');

    attempts.push(...this.computeColors(lineStr, answerStr));
    console.log(attempts);
    return {
      ...state,
      currentRow: state.currentRow + 1,
      attempts: [...state.attempts, attempts],
    };
  });

  private findLastNaNIndex(array: (number | null)[]): number {
    for (let index = array.length - 1; index >= 0; index--) {
      if (array[index] === null) {
        continue;
      }
      return index;
    }
    return -1;
  }

  private computeColors(targetWord: string, guess: string): KeyOfAttempt[] {
    const colors = new Array(guess.length).fill('');
    const indicesOfIncorrectLettersInGuess = [];
    const targetLetters = {} as Record<string, number>;

    for (let i = 0; i < guess.length; ++i) {
      let targetLetter = targetWord[i];
      if (targetLetter in targetLetters) {
        targetLetters[targetLetter]++;
      } else {
        targetLetters[targetLetter] = 1;
      }

      if (guess[i] === targetLetter) {
        colors[i] = Attempt.correct;
        targetLetters[targetLetter]--;
      } else {
        indicesOfIncorrectLettersInGuess.push(i);
      }
    }

    for (const i of indicesOfIncorrectLettersInGuess) {
      let guessLetter = guess[i];

      if (guessLetter in targetLetters && targetLetters[guessLetter] > 0) {
        colors[i] = Attempt.partial;
        targetLetters[guessLetter]--;
      } else {
        colors[i] = Attempt.absent;
      }
    }
    return colors;
  }
}
