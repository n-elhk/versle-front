import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  inject,
} from '@angular/core';
import { BoardService } from 'src/app/core/services/board/board.service';
import { filter, fromEvent, map, tap, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AuthorComponent } from 'src/app/components/modals/author/author.component';
import { LetDirective } from '@ngrx/component';
import { BookPipe } from 'src/app/common/pipes/book.pipe';
import { NgClass, NgTemplateOutlet } from '@angular/common';

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
    NgClass,
    NgTemplateOutlet,
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
  private readonly boardService = inject(BoardService);

  /** Injection of {@link NgZone}. */
  private readonly ngZone = inject(NgZone);

  /** Injection of {@link Dialog}. */
  private readonly dialog = inject(Dialog);

  public readonly versle = this.boardService.selectVersle;

  public readonly attempts = this.boardService.selectAttempts;

  public readonly board = this.boardService.selectBoard;

  public readonly currentRow = this.boardService.selectCurrentRow;

  constructor() {
    this.ngZone.runOutsideAngular(() => {
    fromEvent<KeyboardEvent>(document, 'keydown', { passive: true })
      .pipe(
        map(({ key }) => key),
        filter(canType),
        throttleTime(200, undefined, { leading: true, trailing: true }),
        map((key) => {
          this.ngZone.runTask(() => this.enterLetter(key));
        }),
        takeUntilDestroyed()
      )
      .subscribe();
    });
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

const canType = (key: string) => {
  return !!(
    Object.keys(KeyType).includes(key.toUpperCase()) ||
    !isNaN(parseInt(key, 10))
  );
};
