import {
  Component, OnInit, OnDestroy, signal, computed, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Quiz } from '../quiz/quiz';

export type HomePhase = 'greeting' | 'level-select' | 'quiz';
export type SpaceMode = 'calm' | 'fast' | 'faster' | 'chaos';

export interface LevelCard {
  id: number;
  title: string;          // nombre visible en el card (ej. "El Trigo Dorado")
  displayTitle?: string;  // título en el overlay (ej. "Panadería") — usa title si no hay
  color: string;
  border: string;
  context?: string;
  isTest?: boolean;
  image?: string;
}

const LEVELS: LevelCard[] = [
  {
    id: 1,
    title: 'El Trigo Dorado',
    displayTitle: 'Panadería',
    color: 'linear-gradient(145deg,#1a3a1a,#0d2010)',
    border: '#22c55e',
    image: 'images/character/1.png',
    context: 'La panadería "El Trigo Dorado" ha sido durante más de quince años uno de los negocios más reconocidos de su barrio. Sus productos siempre han sido apreciados por los habitantes de la zona debido a su calidad y sabor tradicional. Sin embargo, durante los últimos seis meses, los propietarios han observado una disminución constante en las ventas. Cada vez ingresan menos clientes al establecimiento y muchos de los compradores habituales ya no realizan sus compras con la misma frecuencia. Al mismo tiempo, han aparecido nuevos competidores que ofrecen pedidos por internet, servicio a domicilio y una fuerte presencia en redes sociales. Los dueños de la panadería están preocupados porque, aunque mantienen la misma calidad en sus productos, los ingresos continúan disminuyendo y no tienen claridad sobre las verdaderas razones que están provocando esta situación.',
  },
  {
    id: 2,
    title: 'Bebida Energética',
    displayTitle: 'Bebida Natural',
    color: 'linear-gradient(145deg,#1a2a3a,#0d1520)',
    border: '#3b82f6',
    image: 'images/character/2.png',
    context: 'Una empresa dedicada a la producción de alimentos saludables ha desarrollado una nueva bebida energética elaborada con ingredientes naturales y sin conservantes artificiales. Los directivos consideran que el producto tiene un gran potencial, especialmente entre estudiantes universitarios, deportistas y personas que buscan alternativas más saludables a las bebidas energéticas tradicionales. Sin embargo, antes de invertir una gran cantidad de dinero en producción, distribución y publicidad, la empresa enfrenta varias incertidumbres. No sabe si los consumidores realmente están interesados en este tipo de bebida, cuáles son los sabores que prefieren, cuánto estarían dispuestos a pagar y qué tan fuerte es la competencia en este segmento del mercado. Además, existe el riesgo de lanzar un producto que no logre aceptación suficiente y genere pérdidas económicas significativas.',
  },
  {
    id: 3,
    title: 'Restaurante Familiar',
    displayTitle: 'Restaurante',
    color: 'linear-gradient(145deg,#2a1a3a,#150d20)',
    border: '#a855f7',
    context: 'Un restaurante familiar que durante años ha mantenido una clientela estable ha comenzado a recibir un número creciente de comentarios negativos. Aunque la calidad de la comida sigue siendo buena, muchos clientes se quejan de largos tiempos de espera para recibir sus pedidos, errores frecuentes en las órdenes y una atención poco cordial por parte de algunos empleados. Las redes sociales del establecimiento también muestran varias reseñas negativas que describen experiencias insatisfactorias. Como consecuencia, algunos clientes habituales han dejado de visitar el restaurante y las recomendaciones boca a boca han disminuido considerablemente. Los propietarios consideran que la situación podría afectar seriamente la reputación del negocio y están buscando alternativas para recuperar la confianza de los consumidores.',
  },
  {
    id: 4,
    title: 'Café Premium',
    displayTitle: 'Café',
    color: 'linear-gradient(145deg,#3a2a1a,#20150d)',
    border: '#f97316',
    image: 'images/character/4.png',
    context: 'Una empresa dedicada a la producción y comercialización de café premium ha logrado consolidarse exitosamente en su ciudad de origen. Gracias a la calidad de sus productos y a una sólida base de clientes, los directivos consideran que ha llegado el momento de expandir sus operaciones hacia una nueva ciudad ubicada en otra región del país. Sin embargo, desconocen los hábitos de consumo de los habitantes de esa zona, las marcas preferidas por los consumidores, el nivel de competencia existente y las diferencias culturales que podrían influir en las decisiones de compra. Además, la expansión requerirá inversiones importantes en logística, distribución, personal y publicidad. La empresa necesita tomar una decisión informada para evitar riesgos que puedan comprometer los recursos acumulados durante años de trabajo.',
  },
  {
    id: 5,
    title: 'Tienda Deportiva',
    displayTitle: 'Tienda Deportiva',
    color: 'linear-gradient(145deg,#3a1a1a,#200d0d)',
    border: '#ef4444',
    image: 'images/character/5.png',
    context: 'Una tienda especializada en artículos deportivos decidió realizar una importante inversión en publicidad digital con el objetivo de aumentar sus ventas y fortalecer el reconocimiento de su marca. Durante varias semanas se publicaron anuncios en redes sociales, plataformas de video y diferentes sitios web. Los reportes mostraron que miles de personas visualizaron la publicidad e interactuaron con los anuncios. Sin embargo, al finalizar la campaña, los propietarios descubrieron que las ventas apenas habían aumentado y que el retorno de la inversión era mucho menor de lo esperado. Aunque aparentemente la publicidad logró captar la atención de muchas personas, los resultados comerciales no fueron satisfactorios. Ahora la empresa necesita comprender qué factores pudieron haber influido en este desempeño y cómo mejorar futuras estrategias de marketing.',
  },
  {
    id: 6,
    title: 'Supermercado Local',
    displayTitle: 'Supermercado',
    color: 'linear-gradient(145deg,#3a3a1a,#1a1a0d)',
    border: '#eab308',
    image: 'images/character/6.png',
    context: 'Un supermercado local que ha servido a su comunidad durante más de una década enfrenta un desafío importante. Recientemente, una reconocida cadena nacional abrió una nueva sucursal a pocas cuadras de distancia. La nueva tienda cuenta con instalaciones modernas, amplios horarios de atención, una gran variedad de productos y agresivas promociones de lanzamiento. Desde la apertura de esta nueva competencia, el supermercado local ha comenzado a notar una disminución progresiva en el número de clientes y en el volumen de ventas. Muchos consumidores han decidido probar la nueva alternativa atraídos por las ofertas y la novedad del establecimiento. Los propietarios del supermercado local están preocupados por el futuro del negocio y necesitan encontrar estrategias que les permitan mantener su participación en el mercado y conservar la fidelidad de sus clientes habituales.',
  },
  { id: 7, title: 'Test',                color: 'linear-gradient(145deg,#1a1a2e,#0f0f1a)', border: '#94a3b8', isTest: true },
];

// Cada string reemplaza al anterior — sin historial
const GREETING_LINES: string[] = [
  'Bienvenido a nuestro stand de Gestión de Mercados.',
  'En esta actividad haremos unas preguntas en base a la situacion que escojas',
  'Tranquilo, no sera tan dificil',
];

const LEVEL_SELECT_LINE = 'Escoje algun personaje y analiza su situacion detenidamente';

@Component({
  selector: 'app-home-intro',
  imports: [CommonModule, Quiz],
  templateUrl: './home-intro.html',
  styleUrl: './home-intro.scss',
  animations: [
    trigger('announcerEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(80px)' }),
        animate('600ms cubic-bezier(0.34,1.4,0.64,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('announcerSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-380px)' }),
        animate('700ms 300ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('bubbleEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.88)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'scale(0.88)' })),
      ]),
    ]),
    trigger('lineSwap', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-14px)' })),
      ]),
    ]),
    trigger('cardsDeal', [
      transition(':enter', [
        query('.level-card', [
          style({ opacity: 0, transform: 'translateX(200px) rotateZ(10deg) scale(0.72)' }),
          stagger(-90, [
            animate('540ms cubic-bezier(0.34,1.2,0.64,1)',
              style({ opacity: 1, transform: 'translateX(0) rotateZ(0) scale(1)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('cardHover', [
      transition('idle => hovered', [
        animate('180ms ease-out', style({ transform: 'translateY(-10px) scale(1.04)' })),
      ]),
      transition('hovered => idle', [
        animate('180ms ease-in', style({ transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('cardExpand', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('350ms cubic-bezier(0.34,1.2,0.64,1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
  ],
})
export class HomeIntro implements OnInit, OnDestroy {
  phase = signal<HomePhase>('greeting');
  spaceMode = signal<SpaceMode>('calm');
  selectedLevelId = signal(1);

  readonly isDebug = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('debug') === 'true';

  // Test solo en debug; nivel 3 oculto temporalmente
  levels = LEVELS.filter(l => (!l.isTest || this.isDebug) && l.id !== 3);

  currentLineIndex = signal(0);
  displayedLine = signal('');
  isTyping = signal(false);

  levelSelectLine = signal('');
  isTypingLevelLine = signal(false);

  hoveredCard   = signal<number | null>(null);
  expandedCard  = signal<LevelCard | null>(null);

  // Imagen del personaje según fase y línea
  // intro:   líneas 0-1 → intro/  |  línea 2 → thinking/
  // level-select → character/
  characterImage = computed(() => {
    const ph = this.phase();
    if (ph === 'level-select') return 'images/intro/3.png';
    if (ph === 'greeting') {
      return this.currentLineIndex() <= 1
        ? 'images/intro/1.png'
        : 'images/intro/2.png';
    }
    return 'images/intro/1.png';
  });

  fireParticles = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 1.2 + Math.random() * 1.8,
  }));

  private typeInterval: any = null;
  private charIndex = 0;
  // Waiting for click/touch to advance to next line
  private waitingForTap = false;

  ngOnInit() {
    setTimeout(() => this.typeLine(0), 500);
  }

  ngOnDestroy() {
    this.clearType();
  }

  // ── Keyboard shortcuts para el fondo ──
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'q' || e.key === 'Q') this.spaceMode.set('fast');
    if (e.key === 'w' || e.key === 'W') this.spaceMode.set('chaos');
  }
  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (e.key === 'q' || e.key === 'Q' || e.key === 'w' || e.key === 'W') {
      this.spaceMode.set('calm');
    }
  }

  // ── Click / touch en la pantalla ──
  onScreenTap() {
    if (this.phase() !== 'greeting') return;

    if (this.isTyping()) {
      // Salta al final de la línea actual
      this.clearType();
      this.displayedLine.set(GREETING_LINES[this.currentLineIndex()]);
      this.isTyping.set(false);
      this.waitingForTap = true;
      return;
    }

    if (this.waitingForTap) {
      this.waitingForTap = false;
      const next = this.currentLineIndex() + 1;
      if (next < GREETING_LINES.length) {
        this.typeLine(next);
      } else {
        this.goToLevelSelect();
      }
    }
  }

  private typeLine(lineIndex: number) {
    const text = GREETING_LINES[lineIndex];
    this.currentLineIndex.set(lineIndex);
    this.charIndex = 0;
    this.displayedLine.set('');
    this.isTyping.set(true);
    this.waitingForTap = false;

    this.typeInterval = setInterval(() => {
      this.charIndex++;
      this.displayedLine.set(text.slice(0, this.charIndex));
      if (this.charIndex >= text.length) {
        this.clearType();
        this.isTyping.set(false);
        this.waitingForTap = true;  // espera tap para continuar
      }
    }, 40);
  }

  private goToLevelSelect() {
    this.phase.set('level-select');
    setTimeout(() => this.typeLevelLine(), 700);
  }

  private typeLevelLine() {
    const text = LEVEL_SELECT_LINE;
    let idx = 0;
    this.levelSelectLine.set('');
    this.isTypingLevelLine.set(true);
    this.typeInterval = setInterval(() => {
      idx++;
      this.levelSelectLine.set(text.slice(0, idx));
      if (idx >= text.length) {
        this.clearType();
        this.isTypingLevelLine.set(false);
      }
    }, 40);
  }

  selectLevel(level: LevelCard) {
    // Si ya está expandido este card → lanzar el quiz
    if (this.expandedCard()?.id === level.id) {
      this.expandedCard.set(null);
      this.phase.set('quiz');
      return;
    }
    // Expandir el card para mostrar el contexto
    this.expandedCard.set(level);
  }

  closeExpanded(e: Event) {
    e.stopPropagation();
    this.expandedCard.set(null);
  }

  startLevel(level: LevelCard, e: Event) {
    e.stopPropagation();
    this.selectedLevelId.set(level.id);
    this.expandedCard.set(null);
    this.phase.set('quiz');
  }

  exitQuiz() {
    this.phase.set('level-select');
    this.spaceMode.set('calm');
  }

  getLevelTitle(): string {
    return this.levels.find(l => l.id === this.selectedLevelId())?.displayTitle
        ?? this.levels.find(l => l.id === this.selectedLevelId())?.title
        ?? '';
  }

  getLevelContext(): string {
    return this.levels.find(l => l.id === this.selectedLevelId())?.context ?? '';
  }

  onQuizSpaceMode(mode: 'fast' | 'faster' | 'chaos') {
    this.spaceMode.set(mode);
  }

  private clearType() {
    if (this.typeInterval) { clearInterval(this.typeInterval); this.typeInterval = null; }
  }

  cardState(id: number) { return this.hoveredCard() === id ? 'hovered' : 'idle'; }
  trackById(_: number, l: LevelCard) { return l.id; }
}
