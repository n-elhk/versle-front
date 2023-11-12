import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BoardComponent } from './pages/board/board.component';
import { EndComponent } from './pages/end/end.component';
import { BoardService } from './core/services/board/board.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardComponent, EndComponent],
})
export class AppComponent {
  public readonly title = 'versle-front';

  /** Injection of {@link BoardService}. */
  private readonly boardService = inject(BoardService);

  public readonly currentRow = this.boardService.selectCurrentRow;
}
