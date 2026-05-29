import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { GameStateService } from '../../game-state';

interface Particle { x: number; y: number; delay: number; size: number; }

@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('titleAnim', [
      transition(':enter', [
        animate('800ms ease-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.5) rotateY(-90deg)', offset: 0 }),
          style({ opacity: 0.7, transform: 'scale(1.05) rotateY(10deg)', offset: 0.7 }),
          style({ opacity: 1, transform: 'scale(1) rotateY(0)', offset: 1 }),
        ])),
      ]),
    ]),
  ],
})
export class Welcome implements OnInit {
  particles: Particle[] = [];
  clicked = false;

  constructor(private gameState: GameStateService) {}

  ngOnInit() {
    this.particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: 4 + Math.random() * 8,
    }));
  }

  start() {
    this.clicked = true;
    setTimeout(() => this.gameState.goToIntro(), 400);
  }
}
