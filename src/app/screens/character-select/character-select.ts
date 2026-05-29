import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { GameStateService, Character } from '../../game-state';

@Component({
  selector: 'app-character-select',
  imports: [CommonModule],
  templateUrl: './character-select.html',
  styleUrl: './character-select.scss',
  animations: [
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.8)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, transform: 'scale(0.5) rotate(15deg)' })),
      ]),
    ]),
    trigger('listStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
        ], { optional: true }),
      ]),
    ]),
    trigger('headerAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class CharacterSelect {
  selectedId = signal<number | null>(null);

  constructor(public gameState: GameStateService) {}

  select(id: number) {
    this.selectedId.set(id);
  }

  add() {
    if (this.gameState.characters().length < 10) {
      this.gameState.addCharacter();
    }
  }

  remove(id: number, event: Event) {
    event.stopPropagation();
    if (this.gameState.characters().length > 2) {
      this.gameState.removeCharacter(id);
    }
  }

  startGame() {
    this.gameState.placeCharactersOnBoard();
    this.gameState.goToGame();
  }

  canAdd() { return this.gameState.characters().length < 10; }
  canRemove() { return this.gameState.characters().length > 2; }

  trackById(_: number, c: Character) { return c.id; }
}
