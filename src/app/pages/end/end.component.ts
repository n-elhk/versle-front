import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { StorageKey } from 'src/app/core/models/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { BOOKS } from 'src/app/core/mock/books';
import { Observable, interval, map } from 'rxjs';
import { BoardService } from 'src/app/core/services/board/board.service';
import { GameService } from 'src/app/core/services/game/game.service';
import { BookPipe } from '../../common/pipes/book.pipe';

@Component({
  selector: 'vs-end',
  standalone: true,
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BookPipe],
})
export class EndComponent {
  /** Injection of {@link DomSanitizer}. */
  private readonly sanitizer = inject(DomSanitizer);

  /** Injection of {@link BoardService}. */
  private readonly boardService = inject(BoardService);

  /** Injection of {@link GameService}. */
  private readonly gameService = inject(GameService);

  public readonly versle = this.boardService.selectVersle;

  private readonly timestamp = signal(
    Number(localStorage.getItem(StorageKey.Date))
  );

  public readonly countdown = toSignal(this.countdown$());

  public readonly url = computed(() => {
    const versle = this.versle();
    if (!versle) {
      return this.sanitizer.bypassSecurityTrustUrl(
        `https://www.aelf.org/bible/`
      );
    }
    return this.sanitizer.bypassSecurityTrustUrl(
      `https://www.aelf.org/bible/${BOOKS[versle.book].key}/${versle.chapter}`
    );
  });

  private countdown$(): Observable<string> {
    return interval(1000).pipe(
      map(() => {
        const timestamp = this.timestamp();
        const { hours, minutes, seconds } = this.countdownToDate(timestamp);

        if (hours + minutes + seconds === 1) {
          this.gameService.replay();
        }

        return `${this.zeroPad(hours)}:${this.zeroPad(minutes)}:${this.zeroPad(
          seconds
        )}`;
      })
    );
  }

  private countdownToDate(timestamp: number) {
    // Obtenir la date actuelle
    const now = new Date();

    // Ajouter 1 jour à la date donnée
    const endDate = new Date(timestamp);
    endDate.setDate(endDate.getDate() + 1);

    // Calculer la différence entre les deux dates en millisecondes
    const difference = endDate.getTime() - now.getTime();

    // Convertir la différence en heures, minutes et secondes.
    const hours = Math.floor(difference / (1000 * 60 * 60)),
      minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Afficher le décompte
    return { hours, minutes, seconds };
  }

  private zeroPad(num: number, places = 2): string {
    return String(num).padStart(places, '0');
  }
}
