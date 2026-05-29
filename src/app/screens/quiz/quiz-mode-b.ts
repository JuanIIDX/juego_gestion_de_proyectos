import {
  Component, Input, Output, EventEmitter, signal, computed,
  OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { QuizQuestion } from './quiz';

export interface MatchConnection {
  leftId: string;
  rightId: string;
}

@Component({
  selector: 'app-quiz-mode-b',
  imports: [CommonModule],
  templateUrl: './quiz-mode-b.html',
  styleUrl: './quiz-mode-b.scss',
  animations: [
    trigger('optionIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-40px)' }),
        animate('380ms cubic-bezier(0.34,1.3,0.64,1)',
          style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('optionInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate('380ms cubic-bezier(0.34,1.3,0.64,1)',
          style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('resultPop', [
      transition(':enter', [
        animate('400ms cubic-bezier(0.34,1.5,0.64,1)', keyframes([
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
export class QuizModeB implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) question!: QuizQuestion;
  @Output() answered = new EventEmitter<boolean>();

  @ViewChild('svgCanvas', { static: false }) svgCanvas!: ElementRef<SVGElement>;
  @ViewChild('matchContainer', { static: false }) matchContainer!: ElementRef<HTMLElement>;

  selectedLeft  = signal<string | null>(null);   // 'A','B','C'
  connections   = signal<MatchConnection[]>([]);  // pares conectados
  revealed      = signal(false);

  svgLines = signal<{ x1:number; y1:number; x2:number; y2:number; id:string; len:number; correct?:boolean }[]>([]);
  svgW = signal(800);
  svgH = signal(400);

  private resizeObserver: ResizeObserver | null = null;

  leftOptions  = computed(() => this.question.leftOptions  ?? []);
  rightOptions = computed(() => this.question.rightOptions ?? []);

  canConfirm = computed(() =>
    this.connections().length === this.leftOptions().length && !this.revealed()
  );

  // El id izquierdo ya tiene conexión
  isLeftConnected = (id: string) => this.connections().some(c => c.leftId === id);
  isRightConnected = (id: string) => this.connections().some(c => c.rightId === id);

  ngOnInit() {}

  ngAfterViewInit() {
    // Recalcula líneas cuando cambia tamaño
    this.resizeObserver = new ResizeObserver(() => this.recalcLines());
    if (this.matchContainer?.nativeElement) {
      this.resizeObserver.observe(this.matchContainer.nativeElement);
    }
    setTimeout(() => this.recalcLines(), 50);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  // ── Selección con click ──
  selectLeft(id: string) {
    if (this.revealed()) return;
    // Si ya estaba seleccionado, deselecciona
    if (this.selectedLeft() === id) { this.selectedLeft.set(null); return; }
    // Si ya tiene conexión, la elimina y lo selecciona
    if (this.isLeftConnected(id)) {
      this.connections.update(c => c.filter(x => x.leftId !== id));
    }
    this.selectedLeft.set(id);
  }

  selectRight(rightId: string) {
    if (this.revealed()) return;
    const leftId = this.selectedLeft();
    if (!leftId) return;

    // Si el derecho ya tiene conexión, elimínala
    this.connections.update(c => c.filter(x => x.rightId !== rightId));
    // Añade la nueva
    this.connections.update(c => [...c, { leftId, rightId }]);
    this.selectedLeft.set(null);
    // Recalcula en el siguiente frame y de nuevo por si el layout tardó
    requestAnimationFrame(() => {
      this.recalcLines();
      setTimeout(() => this.recalcLines(), 80);
    });
  }

  removeConnection(leftId: string) {
    if (this.revealed()) return;
    this.connections.update(c => c.filter(x => x.leftId !== leftId));
    setTimeout(() => this.recalcLines(), 30);
  }

  // ── Confirmar ──
  confirm() {
    if (!this.canConfirm()) return;
    this.revealed.set(true);
    this.recalcLines();

    const correct = this.connections().every(conn => {
      const pair = this.question.correctPairs?.find(p => p.leftId === conn.leftId);
      return pair?.rightId === conn.rightId;
    });

    setTimeout(() => this.answered.emit(correct), 2200);
  }

  isConnectionCorrect(conn: MatchConnection): boolean {
    return this.question.correctPairs?.some(
      p => p.leftId === conn.leftId && p.rightId === conn.rightId
    ) ?? false;
  }

  connectionForLeft(leftId: string) {
    return this.connections().find(c => c.leftId === leftId) ?? null;
  }

  // ── SVG lines ──
  private recalcLines() {
    const container = this.matchContainer?.nativeElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Contenedor aún no tiene dimensiones — reintenta
      setTimeout(() => this.recalcLines(), 60);
      return;
    }
    this.svgW.set(Math.ceil(rect.width));
    this.svgH.set(Math.ceil(rect.height));

    const lines = this.connections().map(conn => {
      const leftEl  = container.querySelector(`[data-left="${conn.leftId}"]`);
      const rightEl = container.querySelector(`[data-right="${conn.rightId}"]`);
      if (!leftEl || !rightEl) return null;

      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();

      const x1 = lr.right  - rect.left;
      const y1 = lr.top    - rect.top + lr.height / 2;
      const x2 = rr.left   - rect.left;
      const y2 = rr.top    - rect.top + rr.height / 2;

      const correct = this.revealed()
        ? this.isConnectionCorrect(conn)
        : undefined;

      const len = this.lineLength(x1, y1, x2, y2);
      return { x1, y1, x2, y2, id: conn.leftId + conn.rightId, len, correct };
    }).filter(Boolean) as { x1:number; y1:number; x2:number; y2:number; id:string; len:number; correct?:boolean }[];

    this.svgLines.set(lines);
  }

  // Curva bezier — si y1 ≈ y2 (línea recta) añade arco para que el path tenga longitud
  linePath(x1: number, y1: number, x2: number, y2: number): string {
    const cx = (x1 + x2) / 2;
    const dy = Math.abs(y2 - y1);
    if (dy < 8) {
      // Línea casi horizontal: fuerza una curva con arco vertical
      const arc = 28;
      return `M ${x1} ${y1} C ${cx} ${y1 - arc}, ${cx} ${y2 - arc}, ${x2} ${y2}`;
    }
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }

  // Longitud aproximada del path para el dasharray (evita el bug de path-length 0)
  lineLength(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Estimación: hipotenusa × 1.2 para compensar la curva
    return Math.max(Math.sqrt(dx * dx + dy * dy) * 1.2, 60);
  }

  lineColor(correct?: boolean): string {
    if (correct === true)  return '#22c55e';
    if (correct === false) return '#ef4444';
    return '#a78bfa';   // violeta mientras se juega
  }

  lineGlow(correct?: boolean): string {
    if (correct === true)  return 'drop-shadow(0 0 6px #22c55e)';
    if (correct === false) return 'drop-shadow(0 0 6px #ef4444)';
    return 'drop-shadow(0 0 5px #a78bfa)';
  }
}
