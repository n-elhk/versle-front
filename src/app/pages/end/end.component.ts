import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageKey } from 'src/app/core/models/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { BOOKS } from 'src/app/core/mock/books';
import { Observable, interval, map } from 'rxjs';
import { BoardService } from 'src/app/core/services/board/board.service';
import { GameService } from 'src/app/core/services/game/game.service';

@Component({
  selector: 'vs-end',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndComponent {
  /** Injection of {@link DomSanitizer}. */
  private sanitizer = inject(DomSanitizer);

  /** Injection of {@link BoardService}. */
  private boardService = inject(BoardService);

  /** Injection of {@link GameService}. */
  private gameService = inject(GameService);

  private versle = this.boardService.selectVersle;

  private timestamp = signal(Number(localStorage.getItem(StorageKey.Date)));

  public countdown = toSignal(this.countdown$());

  public url = computed(() => {
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

    // Convertir la différence en heures, minutes et secondes
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Afficher le décompte
    return { hours, minutes, seconds };
  }

  private zeroPad(num: number, places = 2): string {
    return String(num).padStart(places, '0');
  }
}
