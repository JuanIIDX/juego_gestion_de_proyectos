import {
  Component, Input, Output, EventEmitter, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { SortItem, QuizQuestion } from './quiz';

export interface SortState {
  itemId: number;
  panel: 'center' | 'left' | 'middle' | 'right';
}

@Component({
  selector: 'app-quiz-mode-a',
  imports: [CommonModule],
  templateUrl: './quiz-mode-a.html',
  styleUrl: './quiz-mode-a.scss',
  animations: [
    // Chip entra desde el centro con rebote
    trigger('chipIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5) translateY(20px)' }),
        animate('400ms cubic-bezier(0.34,1.4,0.64,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.7)' })),
      ]),
    ]),
    // Panel destaca cuando se arrastra encima
    trigger('panelPulse', [
      transition('idle => active', [
        animate('200ms ease-out', style({ transform: 'scale(1.02)' })),
      ]),
      transition('active => idle', [
        animate('150ms ease-in', style({ transform: 'scale(1)' })),
      ]),
    ]),
    // Resultado flash sobre cada chip
    trigger('resultFlash', [
      transition(':enter', [
        animate('350ms cubic-bezier(0.34,1.5,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0)',   offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.3)', offset: 0.6 }),
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
export class QuizModeA implements OnInit {
  @Input({ required: true }) question!: QuizQuestion;
  @Input() triple = false;   // true = Modo F (3 paneles)
  @Output() answered = new EventEmitter<boolean>();

  itemStates   = signal<SortState[]>([]);
  revealed     = signal(false);
  hoveredPanel = signal<'left' | 'middle' | 'right' | null>(null);
  draggingId   = signal<number | null>(null);

  // centerItems ya no se usa — todos los chips empiezan en 'left'
  leftItems   = computed(() => this.itemStates().filter(s => s.panel === 'left'));
  middleItems = computed(() => this.itemStates().filter(s => s.panel === 'middle'));
  rightItems  = computed(() => this.itemStates().filter(s => s.panel === 'right'));

  // OK habilitado cuando hay chips en todos los paneles activos (no hay "pila" vacía)
  canConfirm = computed(() => {
    if (this.revealed()) return false;
    if (this.triple) {
      return this.leftItems().length > 0
          && this.middleItems().length > 0
          && this.rightItems().length > 0;
    }
    return this.leftItems().length > 0 && this.rightItems().length > 0;
  });

  ngOnInit() {
    // Todos los chips arrancan en el panel izquierdo
    this.itemStates.set(
      (this.question.items ?? []).map(it => ({ itemId: it.id, panel: 'left' }))
    );
  }

  // ── Drag & Drop (HTML5) ──
  onDragStart(itemId: number, e: DragEvent) {
    this.draggingId.set(itemId);
    e.dataTransfer!.effectAllowed = 'move';
  }

  onDragLeave() { this.hoveredPanel.set(null); }

  onDrop(panel: 'left' | 'middle' | 'right', e: DragEvent) {
    e.preventDefault();
    const id = this.draggingId();
    if (id !== null) this.moveItem(id, panel);
    this.draggingId.set(null);
    this.hoveredPanel.set(null);
  }

  onDragEnd() {
    this.draggingId.set(null);
    this.hoveredPanel.set(null);
  }

  // Click en chip del panel → devuelve al centro
  returnToCenter(itemId: number) {
    if (this.revealed()) return;
    this.moveItem(itemId, 'center');
  }

  // Click en chip del centro → rota entre izquierda y derecha directamente
  cycleItem(itemId: number) {
    if (this.revealed()) return;
    const current = this.itemStates().find(s => s.itemId === itemId)?.panel ?? 'center';
    const next: 'left' | 'right' = current === 'center' || current === 'right' ? 'left' : 'right';
    this.moveItem(itemId, next);
  }

  moveItem(itemId: number, panel: 'center' | 'left' | 'middle' | 'right') {
    if (this.revealed()) return;
    this.itemStates.update(states =>
      states.map(s => s.itemId === itemId ? { ...s, panel } : s)
    );
  }

  itemText(itemId: number): string {
    return this.question.items?.find(it => it.id === itemId)?.text ?? '';
  }

  correctPanel(itemId: number): string {
    const cp = this.question.items?.find(it => it.id === itemId)?.correctPanel ?? 'left';
    // sort3 usa 'center' en los datos pero 'middle' en el estado interno
    return cp === 'center' ? 'middle' : cp;
  }

  isItemCorrect(state: SortState): boolean {
    return state.panel === this.correctPanel(state.itemId);
  }

  onDragOver(panel: 'left' | 'middle' | 'right', e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this.hoveredPanel.set(panel);
  }

  // ── Confirmar ──
  confirm() {
    if (!this.canConfirm()) return;
    this.revealed.set(true);

    const allCorrect = this.itemStates().every(s => this.isItemCorrect(s));
    // Espera que el usuario vea los resultados 1.5s y luego emite
    setTimeout(() => this.answered.emit(allCorrect), 2000);
  }

  panelState(panel: 'left' | 'middle' | 'right') {
    return this.hoveredPanel() === panel ? 'active' : 'idle';
  }
}
