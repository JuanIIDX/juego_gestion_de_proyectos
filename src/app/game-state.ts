import { Injectable, signal } from '@angular/core';

export type GameScreen = 'welcome' | 'intro' | 'character-select' | 'game-board';

export interface Character {
  id: number;
  name: string;
  color: string;
  emoji: string;
  position: number;
  boardIndex: number | null;
}

const DEFAULT_CHARACTERS: Omit<Character, 'position' | 'boardIndex'>[] = [
  { id: 1, name: 'Guerrero', color: '#e74c3c', emoji: '⚔️' },
  { id: 2, name: 'Mago',     color: '#9b59b6', emoji: '🔮' },
  { id: 3, name: 'Arquero',  color: '#2ecc71', emoji: '🏹' },
  { id: 4, name: 'Ladrón',   color: '#f39c12', emoji: '🗡️' },
  { id: 5, name: 'Paladín',  color: '#3498db', emoji: '🛡️' },
];

export const BOARD_TILES = 36;

@Injectable({ providedIn: 'root' })
export class GameStateService {
  screen = signal<GameScreen>('welcome');
  characters = signal<Character[]>(
    DEFAULT_CHARACTERS.map(c => ({ ...c, position: 0, boardIndex: null }))
  );
  nextId = DEFAULT_CHARACTERS.length + 1;

  goToIntro()           { this.screen.set('intro'); }
  goToCharacterSelect() { this.screen.set('character-select'); }
  goToGame()            { this.screen.set('game-board'); }
  goToWelcome()         { this.screen.set('welcome'); }

  addCharacter() {
    const palette = [
      '#e91e63','#00bcd4','#ff5722','#8bc34a','#ffc107',
      '#673ab7','#009688','#ff9800','#03a9f4','#cddc39'
    ];
    const emojis = ['🐉','🦁','🐺','🦊','🦅','🐲','🦄','🔱','🌟','💎'];
    const idx = this.characters().length;
    this.characters.update(chars => [
      ...chars,
      {
        id: this.nextId++,
        name: `Héroe ${chars.length + 1}`,
        color: palette[idx % palette.length],
        emoji: emojis[idx % emojis.length],
        position: 0,
        boardIndex: null,
      }
    ]);
  }

  removeCharacter(id: number) {
    this.characters.update(chars => chars.filter(c => c.id !== id));
  }

  placeCharactersOnBoard() {
    const total = BOARD_TILES;
    const chars  = this.characters();
    const taken  = new Set<number>();
    this.characters.set(chars.map(c => {
      let idx: number;
      do { idx = Math.floor(Math.random() * total); } while (taken.has(idx));
      taken.add(idx);
      return { ...c, boardIndex: idx };
    }));
  }

  reset() {
    this.characters.set(
      DEFAULT_CHARACTERS.map(c => ({ ...c, position: 0, boardIndex: null }))
    );
    this.nextId = DEFAULT_CHARACTERS.length + 1;
    this.screen.set('welcome');
  }
}
