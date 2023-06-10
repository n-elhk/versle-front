import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { BoardService } from './core/services/board/board.service';
import { GameService } from './core/services/game/game.service';

/** @docs-private */
export function initializeGame(gameService: GameService) {
  return () => {
    return gameService.init();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideComponentStore(BoardService),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeGame,
      deps: [GameService],
      multi: true,
    },
  ],
};
