import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Attempt, Board, BoardStore, KeyOfAttempt } from '../../models/board';
import { GameStorage, VersleState } from '../../models/versle';
import { StorageKey } from '../../models/storage';

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

  readonly selectBoard = this.selectSignal(({ board }) => board, {
    equal: (a, b) => a.toString() !== b.toString(),
  });

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
    const { answer, gameState, versle } = { ...value };
    return {
      ...state,
      versle,
      answer,
      ...gameState,
    };
  });

  readonly chooseNumber = this.updater((state, value: number) => {
    const board = state.board;
    const line = board[state.currentRow];

    const deepCopyLine = line.slice() as typeof line;
    deepCopyLine.shift();

    const index = deepCopyLine.findIndex((v) => v === null);

    /** Because we was remove the first of the copy. */
    line[index + 1] = value;

    this.saveGameState({ board });
    return { ...state, ...board };
  });

  readonly deleteLastNumber = this.updater((state) => {
    const board = state.board;
    const line = board[state.currentRow];
    const index = this.findLastNaNIndex(line);

    if (index > 0) {
      line[index] = null;
    }

    this.saveGameState({ board });

    return { ...state, ...board };
  });

  readonly chooseBook = this.updater((state, value: number) => {
    const board = state.board;
    const line = board[state.currentRow];

    line[0] = value;

    this.saveGameState({ board });

    return { ...state, ...board };
  });

  readonly nextLine = this.updater((state) => {
    const board = [...state.board];
    const line = [...board[state.currentRow]];
    const answer = [...state.answer];

    /** Add the first element its a book index. */
    const tempAttempts: KeyOfAttempt[] = [
      line[0] === answer[0] ? Attempt.correct : Attempt.absent,
    ];

    /** Remove the first element its a book index. */
    line.shift();
    answer.shift();

    /** Join for comparaison of the place. */
    const lineStr = line.join('');
    const answerStr = answer.join('');

    tempAttempts.push(...this.computeColors(lineStr, answerStr));
    const currentRow = state.currentRow + 1;
    const attempts = [...state.attempts, tempAttempts];

    this.saveGameState({ attempts, currentRow });

    return {
      ...state,
      currentRow,
      attempts,
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

  saveGameState<T extends keyof GameStorage>(toSave: Pick<GameStorage, T>) {
    const stateStr = localStorage.getItem(StorageKey.GameState);

    if (!stateStr) {
      throw new Error('Can not found state');
    }

    try {
      const vsState: GameStorage = JSON.parse(stateStr);

      for (const key in toSave) {
        vsState[key] = toSave[key];
      }

      localStorage.setItem(StorageKey.GameState, JSON.stringify(vsState));
    } catch (error) {
      console.log('errror', error);
    }
  }
}
