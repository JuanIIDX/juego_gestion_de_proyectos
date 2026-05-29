import { Component } from '@angular/core';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { GameStateService } from './game-state';
import { Welcome } from './screens/welcome/welcome';
import { Intro } from './screens/intro/intro';

@Component({
  selector: 'app-old-shell',
  imports: [Welcome, Intro],
  templateUrl: './old-shell.html',
  styleUrl: './app-shell.scss',
  providers: [GameStateService],
  animations: [
    trigger('screenSlide', [
      transition('welcome => intro', [
        query(':enter', [style({ opacity: 0, transform: 'translateX(100%)' })], { optional: true }),
        group([
          query(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-60%)' }))], { optional: true }),
          query(':enter', [animate('350ms 150ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))], { optional: true }),
        ]),
      ]),
      transition('intro => character-select', [
        query(':enter', [style({ opacity: 0, transform: 'translateX(100%)' })], { optional: true }),
        group([
          query(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-60%)' }))], { optional: true }),
          query(':enter', [animate('350ms 150ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))], { optional: true }),
        ]),
      ]),
      transition('character-select => game-board', [
        query(':enter', [style({ opacity: 0, transform: 'scale(0.8)' })], { optional: true }),
        group([
          query(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'scale(1.1)' }))], { optional: true }),
          query(':enter', [animate('400ms 200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))], { optional: true }),
        ]),
      ]),
      transition('* => welcome', [
        query(':enter', [style({ opacity: 0 })], { optional: true }),
        group([
          query(':leave', [animate('300ms ease-in', style({ opacity: 0 }))], { optional: true }),
          query(':enter', [animate('400ms 200ms ease-out', style({ opacity: 1 }))], { optional: true }),
        ]),
      ]),
    ]),
  ],
})
export class OldShell {
  constructor(public gameState: GameStateService) {}
}
