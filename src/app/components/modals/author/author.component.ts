import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';
import { BOOKS } from 'src/app/core/mock/books';

@Component({
  selector: 'vs-author',
  standalone: true,
  imports: [NgFor],
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorComponent {
  public books = BOOKS;

  /** Injection of {@link DialogRef}. */
  public dialogRef = inject(DialogRef);
}
