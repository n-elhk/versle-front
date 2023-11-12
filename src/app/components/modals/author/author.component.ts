import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { BOOKS } from 'src/app/core/mock/books';

@Component({
  selector: 'vs-author',
  standalone: true,
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorComponent {
  public readonly books = BOOKS;

  /** Injection of {@link DialogRef}. */
  public readonly dialogRef = inject(DialogRef);
}
