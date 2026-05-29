import { Component, OnInit, OnDestroy, signal, computed, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { GameStateService } from '../../game-state';

export type IntroPhase =
  | 'dialog'
  | 'player-count'
  | 'confirm'
  | 'roulette-intro'
  | 'roulette-red'
  | 'roulette-red-done'
  | 'roulette-blue'
  | 'roulette-blue-done'
  | 'roulette-green'
  | 'roulette-green-done'
  | 'topic-reveal';

export interface MarketTopic {
  icon: string;
  title: string;
  description: string;
}

const MARKET_TOPICS: MarketTopic[] = [
  {
    icon: '🎯',
    title: 'Lanzamiento al público equivocado',
    description: 'Una empresa lanzó una bebida energizante pensada para estudiantes universitarios, con publicidad enfocada en exámenes, trasnochos y vida académica. Sin embargo, después de varias semanas, descubrió que quienes más compran el producto son trabajadores con jornadas largas.\n\nAhora el equipo debe decidir si mantiene su estrategia original o si adapta su producto, mensaje y promoción para enfocarse en el público que realmente está comprando.',
  },
  {
    icon: '💲',
    title: 'Precio demasiado alto',
    description: 'Una marca de cuadernos ecológicos logró llamar la atención por su diseño, calidad y materiales reciclados. Aun así, muchos clientes consideran que su precio es demasiado alto frente a otras opciones más económicas del mercado.\n\nEntonces surge la duda: ¿la empresa debe bajar el precio, agregar más valor a la oferta o buscar un segmento que esté dispuesto a pagar más por ese producto?',
  },
  {
    icon: '📢',
    title: 'Promoción que no convence',
    description: 'Una empresa creó una campaña para promocionar una aplicación de organización académica. Aunque muchas personas ven la publicidad, no entienden con claridad para qué sirve la app ni qué la hace diferente de otras opciones.\n\nFrente a esto, el equipo debe preguntarse cómo cambiar el mensaje promocional para que el producto se entienda mejor y resulte más convincente para el cliente.',
  },
  {
    icon: '⚔️',
    title: 'Competidor más barato',
    description: 'Una empresa vende mochilas de buena calidad y diseño moderno, pero aparece un competidor con un producto muy parecido a un precio más bajo. Desde ese momento, varios clientes comienzan a preferir la nueva opción del mercado.\n\nAhora el grupo debe decidir cómo reaccionar: competir bajando el precio o diferenciarse destacando calidad, confianza, diseño o beneficios adicionales.',
  },
  {
    icon: '🙂',
    title: 'Clientes satisfechos, pero pocas ventas',
    description: 'Una marca de postres saludables recibe muy buenos comentarios de quienes prueban sus productos. Los clientes dicen que son ricos, frescos y diferentes, pero la empresa sigue vendiendo poco porque muy pocas personas conocen la marca.\n\nEntonces el equipo debe analizar qué estrategia de promoción, visibilidad o distribución podría ayudar a convertir esa buena experiencia en un mayor número de ventas.',
  },
  {
    icon: '🛒',
    title: 'Canal de venta inadecuado',
    description: 'Una empresa decidió vender sus productos solo por Instagram y WhatsApp, pensando que sería suficiente para llegar al público. Sin embargo, descubre que muchos de sus clientes potenciales prefieren comprar en tienda física o por recomendación directa.\n\nLa pregunta ahora es si deben seguir usando ese canal, combinarlo con otros medios o cambiar completamente la forma en que hacen llegar el producto al mercado.',
  },
  {
    icon: '🔄',
    title: 'Cambio en las preferencias del mercado',
    description: 'Una empresa vende artículos desechables tradicionales, pero empieza a notar que los clientes ahora prefieren opciones ecológicas y biodegradables. Aunque el producto antes funcionaba bien, el mercado ha comenzado a cambiar y la marca pierde interés.\n\nAnte esta situación, el equipo debe pensar si conviene transformar el producto, cambiar la forma de comunicarlo o rediseñar la oferta para responder a las nuevas preferencias del consumidor.',
  },
  {
    icon: '👀',
    title: 'Mucho interés, poca compra',
    description: 'Una empresa ofrece clases personalizadas en línea y logra atraer muchas preguntas sobre precios, horarios y beneficios. A pesar de ese interés inicial, muy pocas personas terminan pagando o inscribiéndose en el servicio.\n\nPor eso el grupo debe preguntarse qué está fallando entre el interés y la compra: el precio, la confianza, la propuesta de valor o la forma en que se presenta la oferta.',
  },
  {
    icon: '📦',
    title: 'Producto bueno, segmento mal elegido',
    description: 'Una empresa diseñó audífonos con cancelación de ruido y buena batería, y decidió promocionarlos para deportistas. Sin embargo, ese público no responde como se esperaba, mientras que estudiantes y trabajadores muestran mucho más interés.\n\nAhora el equipo debe decidir si redefine el segmento al que se dirige y cómo debería ajustar el mensaje, la promoción y el enfoque del producto.',
  },
  {
    icon: '📱',
    title: 'Mala reputación en redes sociales',
    description: 'Un cliente publicó una crítica negativa sobre un producto y el comentario comenzó a compartirse rápidamente en redes sociales. Aunque fue un caso puntual, la marca empezó a perder credibilidad y varios clientes potenciales comenzaron a desconfiar.\n\nFrente a esta crisis, el equipo debe decidir cómo responder para recuperar la confianza del mercado y proteger la imagen de la empresa.',
  },
];

export interface PlayerSlot { id: number; color: string; }

// A single match in the tournament bracket
export interface MatchResult {
  winner: PlayerSlot;
  loser: PlayerSlot;
  topicIcon: string;
}

export interface Matchup {
  p1: PlayerSlot;
  p2: PlayerSlot | null; // null = bye (p1 advances automatically)
}

export interface DebugInfo {
  label: string;
  cssClass: string;
  w: number; h: number;
  top: number; left: number;
  marginBottom: number; marginRight: number;
  domRect: DOMRect;
}

const DIALOG_LINES = [
  '¡Bienvenidos a Gestión de Mercados!',
  'Aquí competirán por dominar los mercados del reino.',
  'El jugador con más riqueza al final... ¡ganará!',
  '¿Cuántos jugadores van a participar hoy?',
];

const ROULETTE_INTRO_FIRST  = 'Bien, ya que están los grupos, ¡comencemos!';
const ROULETTE_INTRO_NEXT   = '¡Sigamos con el siguiente equipo!';
const ROULETTE_RED_DONE     = '¡Genial, qué interesante!';
const ROULETTE_BLUE_DONE    = '¡Vaya...!';
const ROULETTE_GREEN_DONE   = '¡Wow, esta es interesante!';

const CHARS_PER_LINE = 44;

const PLAYER_COLORS = [
  '#e74c3c', '#9b59b6', '#2ecc71', '#f39c12',
  '#3498db', '#e91e63', '#00bcd4', '#ff5722',
  '#8bc34a', '#ffc107',
];

// Total spin duration and how often we move the strip
const SPIN_DURATION = 3000;
const SPIN_TICK     = 60;

const DEBUG_SELECTORS: { label: string; cssClass: string }[] = [
  { label: 'Panel izquierdo',  cssClass: 'panel-left' },
  { label: 'Panel derecho',    cssClass: 'panel-right' },
  { label: 'Anunciador',       cssClass: 'announcer' },
  { label: 'Fila anunciador',  cssClass: 'announcer-row' },
  { label: 'Wrap ruleta roja', cssClass: 'roulette-wrap' },
  { label: 'Ruleta roja',      cssClass: 'red-machine' },
  { label: 'Ruleta azul',      cssClass: 'blue-machine' },
  { label: 'Ruleta verde',     cssClass: 'roulette-green-machine' },
  { label: 'Slot izquierdo',   cssClass: 'left-slot' },
  { label: 'Slot derecho',     cssClass: 'right-slot' },
  { label: 'Globo de texto',   cssClass: 'speech-bubble' },
  { label: 'Área superior',    cssClass: 'top-area' },
  { label: 'Área central',     cssClass: 'middle-area' },
  { label: 'Columna central',  cssClass: 'center-col' },
];

@Component({
  selector: 'app-intro',
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-15px)' })),
      ]),
    ]),
    trigger('slideLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-60px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(60px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('popResult', [
      transition(':enter', [
        animate('400ms ease-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.3)', offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.3)',  offset: 0.65 }),
          style({ opacity: 1, transform: 'scale(1)',    offset: 1 }),
        ])),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-340px)' }),
        animate('500ms cubic-bezier(0.25,0.46,0.45,0.94)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(340px)' }),
        animate('500ms cubic-bezier(0.25,0.46,0.45,0.94)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class Intro implements OnInit, OnDestroy {
  @Input() initialPhase: IntroPhase = 'dialog';

  phase = signal<IntroPhase>('dialog');
  currentLineIndex = signal(0);
  displayedText    = signal('');
  isTyping         = signal(false);
  confirmSelected  = signal(0);

  players = signal<PlayerSlot[]>([
    { id: 0, color: PLAYER_COLORS[0] },
    { id: 1, color: PLAYER_COLORS[1] },
  ]);

  readonly MAX_PLAYERS = 10;
  readonly MIN_PLAYERS = 2;

  dragIndex     = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  // ── Roulette strip indices (drive CSS translateY/X) ──
  redPoolIndex   = signal(0);
  bluePoolIndex  = signal(0);
  greenPoolIndex = signal(0);

  // Which PlayerSlot is currently assigned to each side (set by beginMatchup)
  // null until the roulette finishes landing
  redResult   = signal<PlayerSlot | null>(null);
  blueResult  = signal<PlayerSlot | null>(null);
  greenResult = signal<string | null>(null);

  redSpinning   = signal(false);
  blueSpinning  = signal(false);
  greenSpinning = signal(false);

  selectedTopic      = signal<MarketTopic | null>(null);
  bubbleExpanded     = signal(false);
  bubblePresetHeight = signal<number | null>(null);
  showPlayerInputs   = signal(false);
  playerAnswers      = signal<string[]>([]);

  // Timer: 5 minutes = 300 seconds
  readonly TIMER_TOTAL = 300;
  timerSeconds = signal(300);
  timerActive = signal(false);
  private timerInterval: any = null;

  timerDisplay = computed(() => {
    const s = this.timerSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  timerProgress = computed(() => this.timerSeconds() / this.TIMER_TOTAL);

  startTimer() {
    this.timerSeconds.set(this.TIMER_TOTAL);
    this.timerActive.set(true);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(s => {
        if (s <= 1) { clearInterval(this.timerInterval); this.timerActive.set(false); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerActive.set(false);
  }

  // ── Tournament state ──
  roundPlayers = signal<PlayerSlot[]>([]);
  matchups = signal<Matchup[]>([]);
  currentMatchIndex = signal(0);
  // Results per round: array of rounds, each round is array of MatchResult
  allRoundsHistory = signal<MatchResult[][]>([]);
  // Current round in-progress results
  currentRoundResults = signal<MatchResult[]>([]);
  usedTopicIcons = signal<string[]>([]);
  roundNumber = signal(1);

  // The two players for the current matchup
  currentMatchup = computed(() => {
    const matchups = this.matchups();
    const idx = this.currentMatchIndex();
    return matchups[idx] ?? null;
  });

  // For the header — all rounds history + current round in progress
  headerAllRounds = computed(() => {
    const all = this.allRoundsHistory();
    const cur = this.currentRoundResults();
    return cur.length > 0 ? [...all, cur] : all;
  });

  private typeInterval: any = null;
  private spinInterval: any = null;
  private charIndex = 0;

  // ── Debug ──
  readonly debugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  debugInfos = signal<DebugInfo[]>([]);
  debugHovered = signal<string | null>(null);
  private debugInterval: any = null;

  constructor(public gameState: GameStateService, private el: ElementRef) {}

  ngOnInit() {
    this.phase.set(this.initialPhase);
    if (this.initialPhase === 'dialog') {
      this.startTyping();
    } else if (this.initialPhase === 'player-count') {
      // Arranca directo con el personaje saludando al jugador
      this.startTypingText('¿Cuántos jugadores van a participar hoy?');
    }
    if (this.debugMode) this.startDebugScan();
  }

  ngOnDestroy() {
    this.clearTimer();
    this.stopTimer();
    this.clearSpin();
    if (this.debugInterval) clearInterval(this.debugInterval);
  }

  // ── Debug scan ──
  private startDebugScan() {
    const scan = () => {
      const host = this.el.nativeElement as HTMLElement;
      const infos: DebugInfo[] = [];
      for (const { label, cssClass } of DEBUG_SELECTORS) {
        const sel = '.' + cssClass.trim().split(/\s+/).join('.');
        const node = host.querySelector(sel) as HTMLElement | null;
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const cs = window.getComputedStyle(node);
        infos.push({
          label,
          cssClass,
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
          left: Math.round(r.left),
          marginBottom: Math.round(parseFloat(cs.marginBottom) || 0),
          marginRight:  Math.round(parseFloat(cs.marginRight)  || 0),
          domRect: r,
        });
      }
      this.debugInfos.set(infos);
    };
    scan();
    this.debugInterval = setInterval(scan, 300);
  }

  get currentLine() { return DIALOG_LINES[this.currentLineIndex()]; }
  get isLastLine()  { return this.currentLineIndex() === DIALOG_LINES.length - 1; }
  get playerCount() { return this.players().length; }

  // The two PlayerSlots that will compete in this matchup (set before spin)
  private matchupRed  = signal<PlayerSlot | null>(null);
  private matchupBlue = signal<PlayerSlot | null>(null);

  // Visual pool for red/blue strips: global display numbers (2P, 3P... → 2,3,...)
  // Uses ALL original players so the strip has variety during spin
  get redPool()   { return this.players().map((_, i) => i + 2); }
  get bluePool()  { return this.players().map((_, i) => i + 2); }
  get greenPool() { return MARKET_TOPICS.map(t => t.icon); }

  // Global display number (2-based) for a PlayerSlot
  playerNumber(p: PlayerSlot): number {
    return this.players().findIndex(pl => pl.id === p.id) + 2;
  }

  redCurrent   = computed(() => this.redPool[this.redPoolIndex()   % this.redPool.length]   ?? 2);
  blueCurrent  = computed(() => this.bluePool[this.bluePoolIndex() % this.bluePool.length]  ?? 2);
  greenCurrent = computed(() => this.greenPool[this.greenPoolIndex() % this.greenPool.length] ?? '');

  readonly CELL_H = 100;

  redOffset   = computed(() => -(this.redPoolIndex()   % this.redPool.length)   * this.CELL_H);
  blueOffset  = computed(() => -(this.bluePoolIndex()  % this.bluePool.length)  * this.CELL_H);
  greenOffset = computed(() => -(this.greenPoolIndex() % this.greenPool.length) * this.CELL_H);

  cursorLineIndex = computed(() => {
    const lines = this.visibleLines();
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].length > 0) return i;
    }
    return 0;
  });

  visibleLines = computed(() => {
    const text = this.displayedText();
    if (this.bubbleExpanded()) {
      if (!text) return [''];
      return text.split('\n');
    }
    if (!text) return ['', '', ''];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (test.length > CHARS_PER_LINE && current) { lines.push(current); current = word; }
      else current = test;
    }
    if (current) lines.push(current);
    const result = lines.slice(0, 3);
    while (result.length < 3) result.push('');
    return result;
  });

  // ── Typing ──
  startTypingText(text: string, onDone?: () => void) {
    this.clearTimer();
    this.charIndex = 0;
    this.displayedText.set('');
    this.isTyping.set(true);
    const interval = this.bubbleExpanded() ? 5 : 45;
    this.typeInterval = setInterval(() => {
      this.charIndex++;
      this.displayedText.set(text.slice(0, this.charIndex));
      if (this.charIndex >= text.length) {
        this.clearTimer();
        this.isTyping.set(false);
        onDone?.();
      }
    }, interval);
  }

  startTyping() { this.startTypingText(this.currentLine); }

  clearTimer() {
    if (this.typeInterval) { clearInterval(this.typeInterval); this.typeInterval = null; }
  }

  onScreenClick() {
    if (this.phase() === 'dialog') this.onDialogClick();
  }

  onDialogClick() {
    if (this.phase() !== 'dialog') return;
    if (this.isTyping()) {
      this.clearTimer();
      this.displayedText.set(this.currentLine);
      this.isTyping.set(false);
      return;
    }
    if (this.isLastLine) { this.phase.set('player-count'); return; }
    this.currentLineIndex.update(i => i + 1);
    this.startTyping();
  }

  addPlayer() {
    if (this.playerCount < this.MAX_PLAYERS) {
      const nextId = Math.max(...this.players().map(p => p.id), -1) + 1;
      this.players.update(list => [...list, { id: nextId, color: PLAYER_COLORS[list.length % PLAYER_COLORS.length] }]);
    }
  }
  removePlayer() {
    if (this.playerCount > this.MIN_PLAYERS)
      this.players.update(list => list.slice(0, -1));
  }
  acceptPlayerCount() { this.confirmSelected.set(0); this.phase.set('confirm'); }

  onConfirmKey(event: KeyboardEvent) {
    if (this.phase() !== 'confirm') return;
    if (event.key === 'ArrowLeft'  || event.key === 'ArrowUp')    this.confirmSelected.set(0);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') this.confirmSelected.set(1);
    else if (event.key === 'Enter' || event.key === ' ')           this.confirmChoice(this.confirmSelected());
  }

  confirmChoice(choice: number) {
    if (choice === 1) { this.phase.set('player-count'); return; }
    this.roundPlayers.set([...this.players()]);
    this.roundNumber.set(1);
    this.currentRoundResults.set([]);
    this.allRoundsHistory.set([]);
    this.usedTopicIcons.set([]);
    this.startRound();
  }

  // ── Tournament engine ──

  private buildMatchups(players: PlayerSlot[]): Matchup[] {
    const matchups: Matchup[] = [];
    for (let i = 0; i < players.length; i += 2) {
      matchups.push({ p1: players[i], p2: players[i + 1] ?? null });
    }
    return matchups;
  }

  private startRound() {
    const players = this.roundPlayers();
    if (players.length === 1) {
      const winner = players[0];
      const num = this.playerNumber(winner);
      setTimeout(() => alert(`🏆 ¡Ganador: Jugador ${num}! 🏆`), 300);
      return;
    }
    this.matchups.set(this.buildMatchups(players));
    this.currentMatchIndex.set(0);
    this.currentRoundResults.set([]);
    this.advanceToNextMatch();
  }

  private advanceToNextMatch() {
    const matchups = this.matchups();
    let idx = this.currentMatchIndex();
    // Skip byes — record them silently
    while (idx < matchups.length && matchups[idx].p2 === null) {
      idx++;
      this.currentMatchIndex.set(idx);
    }
    if (idx >= matchups.length) {
      this.finishRound();
      return;
    }
    this.beginMatchup(matchups[idx]);
  }

  private beginMatchup(matchup: Matchup) {
    // Randomly assign which matchup player goes to red vs blue
    const p1 = matchup.p1;
    const p2 = matchup.p2;
    const redIsP1 = Math.random() < 0.5;
    this.matchupRed.set(redIsP1 ? p1 : (p2 ?? p1));
    this.matchupBlue.set(redIsP1 ? (p2 ?? p1) : p1);

    // Reset display state
    this.redResult.set(null);
    this.blueResult.set(null);
    this.greenResult.set(null);
    this.selectedTopic.set(null);
    this.bubbleExpanded.set(false);
    this.bubblePresetHeight.set(null);
    this.showPlayerInputs.set(false);
    this.playerAnswers.set([]);
    this.stopTimer();

    const isFirst = this.currentMatchIndex() === 0 && this.roundNumber() === 1;
    this.phase.set('roulette-intro');
    this.startTypingText(isFirst ? ROULETTE_INTRO_FIRST : ROULETTE_INTRO_NEXT, () => {
      setTimeout(() => this.launchRedRoulette(), 800);
    });
  }

  private finishRound() {
    const matchups = this.matchups();
    const results  = this.currentRoundResults();
    const winners: PlayerSlot[] = [];

    for (const m of matchups) {
      if (m.p2 === null) {
        winners.push(m.p1); // bye
      } else {
        const r = results.find((x: MatchResult) => x.winner.id === m.p1.id || x.winner.id === m.p2!.id);
        if (r) winners.push(r.winner);
      }
    }

    // Archive this round and advance
    this.allRoundsHistory.update((all: MatchResult[][]) => [...all, results]);

    if (winners.length <= 1) {
      const winner = winners[0];
      if (winner) {
        const num = this.playerNumber(winner);
        setTimeout(() => alert(`🏆 ¡Ganador: Jugador ${num}! 🏆`), 300);
      }
      return;
    }
    this.roundPlayers.set(winners);
    this.roundNumber.update(n => n + 1);
    this.startRound();
  }

  /** ✓ button: 'left' = red-side player wins, 'right' = blue-side player wins */
  declareWinner(side: 'left' | 'right') {
    const redPlayer  = this.redResult();
    const bluePlayer = this.blueResult();
    if (!redPlayer || !bluePlayer) return;

    const winner = side === 'left' ? redPlayer  : bluePlayer;
    const loser  = side === 'left' ? bluePlayer : redPlayer;
    const icon = this.selectedTopic()?.icon ?? '';

    this.currentRoundResults.update((h: MatchResult[]) => [...h, { winner, loser, topicIcon: icon }]);

    this.stopTimer();
    this.showPlayerInputs.set(false);
    this.currentMatchIndex.update(i => i + 1);
    setTimeout(() => this.advanceToNextMatch(), 600);
  }

  // ── Roulette engine ──
  private clearSpin() {
    if (this.spinInterval) { clearInterval(this.spinInterval); this.spinInterval = null; }
  }

  private spinRoulette<T>(
    poolGetter: () => T[],
    indexSetter: (v: number) => void,
    spinningSetter: (v: boolean) => void,
    resultSetter: (v: T) => void,
    onDone: () => void,
    forcedWinnerIndex?: number
  ) {
    const pool = poolGetter();
    const winnerIdx = forcedWinnerIndex !== undefined
      ? forcedWinnerIndex
      : Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIdx];

    let tick = 0;
    const maxTicks = Math.floor(SPIN_DURATION / SPIN_TICK);
    let currentIdx = 0;
    spinningSetter(true);
    this.clearSpin();

    this.spinInterval = setInterval(() => {
      tick++;
      const progress = tick / maxTicks;
      const step = progress < 0.7 ? 3 : progress < 0.9 ? 2 : 1;
      currentIdx = (currentIdx + step) % pool.length;
      indexSetter(currentIdx);

      if (tick >= maxTicks) {
        this.clearSpin();
        indexSetter(winnerIdx);
        resultSetter(winner);
        spinningSetter(false);
        onDone();
      }
    }, SPIN_TICK);
  }

  launchRedRoulette() {
    this.phase.set('roulette-red');
    this.redPoolIndex.set(0);
    // The pre-chosen red player — find its display number in redPool
    const pendingRed = this.matchupRed();
    const displayNum = pendingRed ? this.playerNumber(pendingRed) : 2;
    // redPool is [2,3,4,...], so index of displayNum is displayNum - 2
    const forcedIdx = Math.max(0, displayNum - 2);
    this.spinRoulette(
      () => this.redPool,
      v => this.redPoolIndex.set(v),
      v => this.redSpinning.set(v),
      _v => { /* display number landed — we store the actual PlayerSlot */ },
      () => {
        this.redResult.set(pendingRed);
        this.phase.set('roulette-red-done');
        this.startTypingText(ROULETTE_RED_DONE, () => {
          setTimeout(() => this.launchBlueRoulette(), 700);
        });
      },
      forcedIdx
    );
  }

  launchBlueRoulette() {
    this.phase.set('roulette-blue');
    this.bluePoolIndex.set(0);
    // The pre-chosen blue player
    const pendingBlue = this.matchupBlue();
    const displayNum = pendingBlue ? this.playerNumber(pendingBlue) : 2;
    const forcedIdx = Math.max(0, displayNum - 2);
    this.spinRoulette(
      () => this.bluePool,
      v => this.bluePoolIndex.set(v),
      v => this.blueSpinning.set(v),
      _v => { /* display number landed — we store the actual PlayerSlot */ },
      () => {
        this.blueResult.set(pendingBlue);
        this.phase.set('roulette-blue-done');
        this.startTypingText(ROULETTE_BLUE_DONE, () => {
          setTimeout(() => this.launchGreenRoulette(), 700);
        });
      },
      forcedIdx
    );
  }

  launchGreenRoulette() {
    this.phase.set('roulette-green');
    this.greenPoolIndex.set(0);
    // Pick a topic that hasn't been used yet
    const used = this.usedTopicIcons();
    const available = MARKET_TOPICS.filter(t => !used.includes(t.icon));
    const pool = available.length > 0 ? available : MARKET_TOPICS; // fallback if all used

    this.spinRoulette(
      () => pool.map(t => t.icon),
      v => this.greenPoolIndex.set(v),
      v => this.greenSpinning.set(v),
      v => this.greenResult.set(v),
      () => {
        const icon = this.greenResult();
        const topic = MARKET_TOPICS.find(t => t.icon === icon) ?? null;
        this.selectedTopic.set(topic);
        if (icon) this.usedTopicIcons.update(u => [...u, icon]);
        this.phase.set('roulette-green-done');
        this.startTypingText(ROULETTE_GREEN_DONE, () => {
          setTimeout(() => this.revealTopic(), 800);
        });
      }
    );
  }

  revealTopic() {
    const topic = this.selectedTopic();
    if (!topic) return;
    this.phase.set('topic-reveal');
    this.bubbleExpanded.set(true);
    const fullText = topic.title + '\n\n' + topic.description;

    setTimeout(() => {
      const host = this.el.nativeElement as HTMLElement;
      const bubble = host.querySelector('.speech-bubble') as HTMLElement | null;
      if (!bubble) { this.startTypingText(fullText); return; }

      const ghost = document.createElement('div');
      ghost.className = bubble.className + ' bubble-expanded bubble-visible';
      ghost.style.cssText = `
        visibility: hidden;
        position: fixed;
        top: 0; left: 0;
        width: ${bubble.getBoundingClientRect().width}px;
        min-height: 0;
        pointer-events: none;
        z-index: -1;
      `;
      ghost.innerHTML = `<div class="bubble-inner"><div class="bubble-lines">${
        fullText.split('\n').map((line, i) =>
          `<div class="bubble-line${i === 0 ? ' topic-title-line' : ''}">${line || '\u00a0'}</div>`
        ).join('')
      }</div></div>`;

      document.body.appendChild(ghost);
      requestAnimationFrame(() => {
        const h = ghost.getBoundingClientRect().height;
        ghost.remove();
        this.bubblePresetHeight.set(h);
        const matchup = this.currentMatchup();
        const players = matchup ? [matchup.p1, matchup.p2].filter(Boolean) as PlayerSlot[] : [];
        this.playerAnswers.set(players.map(() => ''));
        this.startTypingText(fullText, () => {
          setTimeout(() => {
            this.showPlayerInputs.set(true);
            this.startTimer();
          }, 400);
        });
      });
    }, 30);
  }

  playerColor(n: number) { return this.players()[n - 1]?.color ?? '#888'; }

  /** Color of the player who landed on red roulette */
  leftPanelColor = computed(() => this.redResult()?.color ?? '#888');

  /** Color of the player who landed on blue roulette */
  rightPanelColor = computed(() => this.blueResult()?.color ?? null);

  /** Global player label for the left (red) panel */
  leftPanelLabel = computed(() => {
    const p = this.redResult();
    return p ? `${this.playerNumber(p)}P` : '';
  });

  /** Global player label for the right (blue) panel */
  rightPanelLabel = computed(() => {
    const p = this.blueResult();
    return p ? `${this.playerNumber(p)}P` : '';
  });

  updateAnswer(index: number, value: string) {
    this.playerAnswers.update(arr => {
      const copy = [...arr];
      copy[index] = value;
      return copy;
    });
  }

  // ── Drag ──
  onDragStart(i: number, e: DragEvent) { this.dragIndex.set(i); e.dataTransfer!.effectAllowed = 'move'; }
  onDragOver(i: number, e: DragEvent)  { e.preventDefault(); e.dataTransfer!.dropEffect = 'move'; this.dragOverIndex.set(i); }
  onDrop(target: number, e: DragEvent) {
    e.preventDefault();
    const from = this.dragIndex();
    if (from === null || from === target) { this.clearDrag(); return; }
    this.players.update(list => {
      const arr = [...list];
      const [item] = arr.splice(from, 1);
      arr.splice(target, 0, item);
      return arr;
    });
    this.clearDrag();
  }
  onDragEnd()  { this.clearDrag(); }
  clearDrag()  { this.dragIndex.set(null); this.dragOverIndex.set(null); }

  // ── Visibility helpers ──
  isRoulettePhase() {
    const p = this.phase();
    return p === 'roulette-intro' || p === 'roulette-red' || p === 'roulette-red-done'
        || p === 'roulette-blue'  || p === 'roulette-blue-done' || p === 'roulette-green'
        || p === 'roulette-green-done' || p === 'topic-reveal';
  }
  showBubble() {
    const p = this.phase();
    return p === 'dialog' || p === 'player-count' || p === 'roulette-intro'
        || p === 'roulette-red-done' || p === 'roulette-blue-done'
        || p === 'roulette-green-done' || p === 'topic-reveal';
  }
  showRedRoulette() {
    const p = this.phase();
    return p === 'roulette-red' || p === 'roulette-red-done'
        || p === 'roulette-blue' || p === 'roulette-blue-done' || p === 'roulette-green'
        || p === 'roulette-green-done' || p === 'topic-reveal';
  }
  showBlueRoulette() {
    const p = this.phase();
    return p === 'roulette-blue' || p === 'roulette-blue-done' || p === 'roulette-green'
        || p === 'roulette-green-done' || p === 'topic-reveal';
  }
  showGreenRoulette() {
    const p = this.phase();
    return p === 'roulette-green' || p === 'roulette-green-done' || p === 'topic-reveal';
  }

  /** Whether the panels should show (roulette phase with two players assigned) */
  showPanels() {
    return this.isRoulettePhase() && this.currentMatchup() !== null;
  }

  private applyPlayers() {
    const count = this.playerCount;
    const current = this.gameState.characters();
    if (current.length > count) current.slice(count).forEach(c => this.gameState.removeCharacter(c.id));
    else for (let i = 0; i < count - current.length; i++) this.gameState.addCharacter();
    this.gameState.placeCharactersOnBoard();
  }

  trackById(_: number, p: PlayerSlot) { return p.id; }
}
