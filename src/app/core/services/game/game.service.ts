import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { StorageKey } from '../../models/storage';
import { VERSES } from '../../mock/verses';
import { BoardService, DEFAULT_BOARD } from '../board/board.service';
import { Versle, VersleState } from '../../models/versle';
import { Answer } from '../../models/board';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private boardService = inject(BoardService);

  public init(): Observable<boolean> {
    return of(this.getVersle()).pipe(
      tap((res) => this.boardService.init(res)),
      map(() => true)
    );
  }

  /**
   * @returns Versle object
   */
  public getVersle(): VersleState {
    const answerStr = localStorage.getItem(StorageKey.Answer),
      board = localStorage.getItem(StorageKey.BoardState);

    if (this.checkLastSaved() || !answerStr || !board) {
      return this.reset();
    }

    const versle = JSON.parse(window.atob(answerStr));

    return {
      answer: this.getAnswer(versle),
      versle,
      board: JSON.parse(board),
    };
  }

  public replay(): void {
    const tt = this.getVersle();
    this.boardService.init(tt);
  }

  private checkLastSaved(): boolean {
    const timestamp = localStorage.getItem(StorageKey.Date);

    if (!timestamp || this.isTodayAtLeastOneDayAhead(Number(timestamp))) {
      return true;
    }

    return false;
  }

  private isTodayAtLeastOneDayAhead(timestamp: number): boolean {
    const date = new Date(timestamp),
      today = new Date(),
      oneDay = 24 * 60 * 60 * 1000; // Nombre de millisecondes dans une journée

    /**
     * Compare les dates avec l'écart d'une journée
     * 3_000 car il y a un petit écart sinon 0
     */
    if (date.getTime() + oneDay - today.getTime() < 3_000) {
      return true;
    }

    return false;
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getAnswer(versle: Versle): Answer {
    const chapters = versle.chapter
      .toString()
      .split('')
      .map((r) => r.padStart(2, '0')) as [string, string];

    const verses = versle.verse
      .toString()
      .split('')
      .map((r) => r.padStart(2, '0')) as [string, string];

    console.log('[versle.book, ...chapters, ...verses]', [
      versle.book,
      ...chapters,
      ...verses,
    ]);
    return [versle.book, ...chapters, ...verses];
  }

  private reset(): VersleState {
    const random = this.getRandomNumber(0, VERSES.length - 1);

    const versle = VERSES[random];

    const b64 = window.btoa(JSON.stringify(versle)),
      newDate = new Date().getTime();

    localStorage.setItem(StorageKey.Answer, b64);
    localStorage.setItem(StorageKey.Date, newDate.toString());
    localStorage.setItem(StorageKey.BoardState, JSON.stringify(DEFAULT_BOARD));

    return {
      answer: this.getAnswer(versle),
      versle,
      board: DEFAULT_BOARD,
    };
  }
}
