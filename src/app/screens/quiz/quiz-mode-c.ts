import {
  Component, Input, Output, EventEmitter, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { QuizQuestion, OrderOption } from './quiz';

@Component({
  selector: 'app-quiz-mode-c',
  imports: [CommonModule],
  templateUrl: './quiz-mode-c.html',
  styleUrl: './quiz-mode-c.scss',
  animations: [
    // Casilla de arriba — aparece con rebote
    trigger('slotIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7) translateY(-20px)' }),
        animate('400ms cubic-bezier(0.34,1.4,0.64,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
    ]),
    // Opciones A/B/C — entran desde abajo escalonadas
    trigger('optionIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.85)' }),
        animate('420ms cubic-bezier(0.34,1.3,0.64,1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.7)' })),
      ]),
    ]),
    // Chip colocado en casilla — "cae" dentro
    trigger('chipDrop', [
      transition(':enter', [
        animate('350ms cubic-bezier(0.34,1.5,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0.4) translateY(-30px)', offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.1) translateY(4px)',   offset: 0.7 }),
          style({ opacity: 1, transform: 'scale(1)  translateY(0)',      offset: 1 }),
        ])),
      ]),
      transition(':leave', [
        animate('180ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })),
      ]),
    ]),
    // Resultado flash sobre cada casilla
    trigger('resultPop', [
      transition(':enter', [
        animate('400ms cubic-bezier(0.34,1.6,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0)',   offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.3)', offset: 0.65 }),
          style({ opacity: 1, transform: 'scale(1)',   offset: 1 }),
        ])),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class QuizModeC implements OnInit {
  @Input({ required: true }) question!: QuizQuestion;
  @Output() answered = new EventEmitter<boolean>();

  // Las 3 casillas de arriba: null = vacía, string = id de opción colocada
  slots = signal<(string | null)[]>([null, null, null]);
  // Opciones todavía disponibles abajo (no colocadas aún)
  revealed = signal(false);
  selectedOption = signal<string | null>(null);  // opción seleccionada lista para colocar

  options = computed(() => this.question.orderOptions ?? []);

  // Opciones que no están en ningún slot
  availableOptions = computed(() => {
    const placed = this.slots().filter(Boolean) as string[];
    return this.options().filter(o => !placed.includes(o.id));
  });

  // OK habilitado cuando todos los slots están llenos
  canConfirm = computed(() =>
    this.slots().every(s => s !== null) && !this.revealed()
  );

  ngOnInit() {
    this.slots.set(new Array(this.options().length).fill(null));
  }

  // ── Click en opción: la coloca en el siguiente slot vacío automáticamente ──
  selectOption(id: string) {
    if (this.revealed()) return;
    const nextEmpty = this.slots().findIndex(s => s === null);
    if (nextEmpty === -1) return;
    this.slots.update(s => s.map((v, i) => i === nextEmpty ? id : v));
  }

  // ── Click en casilla ocupada: la devuelve abajo ──
  clickSlot(index: number) {
    if (this.revealed()) return;
    const current = this.slots()[index];
    if (current !== null) {
      this.slots.update(s => s.map((v, i) => i === index ? null : v));
    }
  }

  // ── Cancelar: quita el último elemento colocado ──
  cancelLast() {
    if (this.revealed()) return;
    const lastFilled = [...this.slots()].map((v, i) => ({ v, i }))
      .filter(x => x.v !== null).pop();
    if (!lastFilled) return;
    this.slots.update(s => s.map((v, i) => i === lastFilled.i ? null : v));
  }

  // ── Click en opción que YA está en un slot (también desde abajo para deselect) ──
  optionTextForSlot(index: number): string {
    const id = this.slots()[index];
    return this.options().find(o => o.id === id)?.text ?? '';
  }

  optionIdForSlot(index: number): string {
    return this.slots()[index] ?? '';
  }

  isSlotCorrect(index: number): boolean {
    const placed = this.slots()[index];
    const correct = this.question.correctOrder?.[index];
    return placed === correct;
  }

  // ── Confirmar ──
  confirm() {
    if (!this.canConfirm()) return;
    this.revealed.set(true);
    const allCorrect = this.slots().every((_, i) => this.isSlotCorrect(i));
    setTimeout(() => this.answered.emit(allCorrect), 2000);
  }

  trackByIndex(i: number) { return i; }
  trackById(_: number, o: OrderOption) { return o.id; }
}
