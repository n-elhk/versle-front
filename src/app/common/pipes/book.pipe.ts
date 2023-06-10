import { Pipe, PipeTransform } from '@angular/core';
import { BOOKS } from 'src/app/core/mock/books';

@Pipe({
  name: 'book',
  standalone: true,
  pure: true,
})
export class BookPipe implements PipeTransform {
  public transform(index: number): string {
    return BOOKS[index].title;
  }
}
