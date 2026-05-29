import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { GameStateService, Character, BOARD_TILES } from '../../game-state';

export interface Tile {
  index: number;
  type: 'normal' | 'start' | 'end' | 'special' | 'danger';
  label?: string;
  icon?: string;
}

const SPECIAL_TILES: Record<number, Omit<Tile, 'index' | 'type'> & { type: Tile['type'] }> = {
  0:  { type: 'start',   label: 'Inicio', icon: '🏁' },
  35: { type: 'end',     label: 'Meta',   icon: '🏆' },
  6:  { type: 'special', label: 'Tesoro', icon: '💰' },
  12: { type: 'danger',  label: 'Trampa', icon: '💀' },
  18: { type: 'special', label: 'Portal', icon: '🌀' },
  24: { type: 'danger',  label: 'Foso',   icon: '🔥' },
  30: { type: 'special', label: 'Salud',  icon: '💚' },
};

@Component({
  selector: 'app-game-board',
  imports: [CommonModule],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss',
  animations: [
    trigger('tokenDrop', [
      transition(':enter', [
        animate('600ms ease-out', keyframes([
          style({ opacity: 0, transform: 'translateY(-60px) scale(0.3)', offset: 0 }),
          style({ opacity: 1, transform: 'translateY(4px) scale(1.2)', offset: 0.7 }),
          style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 1 }),
        ])),
      ]),
    ]),
    trigger('boardAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'perspective(800px) rotateX(30deg) scale(0.7)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'perspective(800px) rotateX(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class GameBoard implements OnInit {
  tiles: Tile[] = [];
  cols = 6;
  rows = 6;
  showPlacement = signal(false);

  constructor(public gameState: GameStateService) {}

  ngOnInit() {
    this.tiles = Array.from({ length: BOARD_TILES }, (_, i) => ({
      index: i,
      type: SPECIAL_TILES[i]?.type ?? 'normal',
      label: SPECIAL_TILES[i]?.label,
      icon:  SPECIAL_TILES[i]?.icon,
    }));

    // Stagger placement animation
    setTimeout(() => this.showPlacement.set(true), 300);
  }

  getCharactersOnTile(tileIndex: number): Character[] {
    return this.gameState.characters().filter(c => c.boardIndex === tileIndex);
  }

  tileRow(index: number) { return Math.floor(index / this.cols); }
  tileCol(index: number) {
    const row = this.tileRow(index);
    // Snake path: even rows L→R, odd rows R→L
    return row % 2 === 0 ? index % this.cols : this.cols - 1 - (index % this.cols);
  }

  trackByIndex(_: number, t: Tile)      { return t.index; }
  trackById(_: number, c: Character)    { return c.id; }

  restart() { this.gameState.reset(); }
}
