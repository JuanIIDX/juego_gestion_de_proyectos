import {
  Component, Input, Output, EventEmitter, signal, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { QuizQuestion } from './quiz';

@Component({
  selector: 'app-quiz-mode-e',
  imports: [CommonModule],
  templateUrl: './quiz-mode-e.html',
  styleUrl: './quiz-mode-e.scss',
  animations: [
    // Botones entran desde abajo
    trigger('btnIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(60px) scale(0.8)' }),
        animate('450ms cubic-bezier(0.34,1.4,0.64,1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    // Resultado O/X explota
    trigger('resultBoom', [
      transition(':enter', [
        animate('550ms cubic-bezier(0.34,1.6,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0)',    offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.4)', offset: 0.6 }),
          style({ opacity: 1, transform: 'scale(1)',   offset: 1 }),
        ])),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class QuizModeE implements OnInit {
  @Input({ required: true }) question!: QuizQuestion;
  @Output() answered = new EventEmitter<boolean>();

  chosen   = signal<boolean | null>(null);  // true = ○, false = ✕
  revealed = signal(false);

  ngOnInit() {}

  pick(value: boolean) {
    if (this.revealed()) return;
    this.chosen.set(value);
    this.revealed.set(true);

    const correct = value === this.question.correctAnswer;
    setTimeout(() => this.answered.emit(correct), 1800);
  }

  isCorrectChoice = (value: boolean) =>
    this.revealed() && this.chosen() === value && value === this.question.correctAnswer;

  isWrongChoice = (value: boolean) =>
    this.revealed() && this.chosen() === value && value !== this.question.correctAnswer;
}
