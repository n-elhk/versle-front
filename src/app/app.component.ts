import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './pages/board/board.component';
import { EndComponent } from './pages/end/end.component';
import { BoardService } from './core/services/board/board.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BoardComponent, EndComponent],
})
export class AppComponent {
  public title = 'versle-front';

  /** Injection of {@link BoardService}. */
  private boardService = inject(BoardService);

  public currentRow = this.boardService.selectCurrentRow;
}
