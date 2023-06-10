import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from 'src/app/core/services/board/board.service';
import {
  Observable,
  filter,
  fromEvent,
  interval,
  map,
  tap,
  throttleTime,
} from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AuthorComponent } from 'src/app/components/modals/author/author.component';
import { LetDirective } from '@ngrx/component';
import { BookPipe } from 'src/app/common/pipes/book.pipe';
import { StorageKey } from 'src/app/core/models/storage';
import { BOOKS } from 'src/app/core/mock/books';
import { DomSanitizer } from '@angular/platform-browser';
import { GameService } from 'src/app/core/services/game/game.service';

export enum KeyType {
  LETTER = 'LETTER',
  ENTER = 'ENTER',
  BACKSPACE = 'BACKSPACE',
  DELETE = 'DELETE',
  ESCAPE = 'ESCAPE',
}

@Component({
  selector: 'vs-board',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    AuthorComponent,
    LetDirective,
    BookPipe,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  /** Injection of {@link BoardService}. */
  private boardService = inject(BoardService);

  /** Injection of {@link Dialog}. */
  private dialog = inject(Dialog);


  public versle = this.boardService.selectVersle;

  public attempts = this.boardService.selectAttempts;

  public board = this.boardService.selectBoard;

  public currentRow = this.boardService.selectCurrentRow;

  constructor() {
    fromEvent<KeyboardEvent>(document, 'keydown', { passive: true })
      .pipe(
        throttleTime(200, undefined, { leading: true, trailing: true }),
        map((ev) => this.enterLetter(ev.key)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public openAuthorDialog(): void {
    const dialog = this.dialog.open<number>(AuthorComponent, {
      width: '500px',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialog.closed
      .pipe(
        filter((value): value is number => typeof value === 'number'),
        tap((bookIndex) => this.boardService.chooseBook(bookIndex))
      )
      .subscribe();
  }

  public enterLetter(letter: string): void {
    if (this.currentRow() > 5) {
      return;
    }

    const key = letter.toUpperCase();

    if (key.match('BACKSPACE|DELETE|ESCAPE')) {
      this.boardService.deleteLastNumber();
      return;
    }

    const lineInputIsComplete = this.boardService.lineInputIsComplete();
    const value = parseInt(key, 10);

    if (!lineInputIsComplete && !isNaN(value)) {
      this.boardService.chooseNumber(value);
      return;
    }

    const lineIsComplete = this.boardService.lineIsComplete();

    if (KeyType.ENTER === key && lineIsComplete) {
      this.boardService.nextLine();
      return;
    }
  }
}
