import {
  Component, Input, Output, EventEmitter, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes, stagger, query } from '@angular/animations';
import { QuizQuestion, ChoiceOption } from './quiz';

@Component({
  selector: 'app-quiz-mode-d',
  imports: [CommonModule],
  templateUrl: './quiz-mode-d.html',
  styleUrl: './quiz-mode-d.scss',
  animations: [
    // Opciones entran escalonadas desde abajo
    trigger('optionsIn', [
      transition(':enter', [
        query('.choice-row', [
          style({ opacity: 0, transform: 'translateY(30px) scaleY(0.85)' }),
          stagger(80, [
            animate('380ms cubic-bezier(0.34,1.3,0.64,1)',
              style({ opacity: 1, transform: 'translateY(0) scaleY(1)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    // Destello al seleccionar
    trigger('selectFlash', [
      transition('* => selected', [
        animate('300ms cubic-bezier(0.34,1.5,0.64,1)', keyframes([
          style({ transform: 'scaleX(1)',    offset: 0 }),
          style({ transform: 'scaleX(1.03)', offset: 0.4 }),
          style({ transform: 'scaleX(1)',    offset: 1 }),
        ])),
      ]),
    ]),
    // Resultado por encima de la opción
    trigger('resultBadge', [
      transition(':enter', [
        animate('400ms cubic-bezier(0.34,1.6,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0)',   offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.3)', offset: 0.65 }),
          style({ opacity: 1, transform: 'scale(1)',   offset: 1 }),
        ])),
      ]),
    ]),
  ],
})
export class QuizModeD implements OnInit {
  @Input({ required: true }) question!: QuizQuestion;
  @Output() answered = new EventEmitter<boolean>();

  selectedId = signal<string | null>(null);
  revealed   = signal(false);

  options: ChoiceOption[] = [];

  ngOnInit() {
    this.options = this.question.choiceOptions ?? [];
  }

  select(id: string) {
    if (this.revealed()) return;
    this.selectedId.set(id);
    // Pequeño delay antes de revelar para ver el flash
    setTimeout(() => this.reveal(), 400);
  }

  private reveal() {
    this.revealed.set(true);
    const correct = this.selectedId() === this.question.correctChoiceId;
    setTimeout(() => this.answered.emit(correct), 1800);
  }

  optionState(id: string): string {
    return this.selectedId() === id ? 'selected' : 'idle';
  }

  isCorrect(id: string) { return id === this.question.correctChoiceId; }
  isWrong(id: string)   { return this.revealed() && this.selectedId() === id && id !== this.question.correctChoiceId; }
  isRight(id: string)   { return this.revealed() && id === this.question.correctChoiceId; }
}

// Necesario para ngOnInit sin importar por separado
import { OnInit } from '@angular/core';
