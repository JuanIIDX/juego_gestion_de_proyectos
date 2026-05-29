import {
  Component, OnInit, OnDestroy, signal, computed, Input, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { QuizModeA } from './quiz-mode-a';
import { QuizModeB } from './quiz-mode-b';
import { QuizModeC } from './quiz-mode-c';
import { QuizModeD } from './quiz-mode-d';
import { QuizModeE } from './quiz-mode-e';
import { IS_BORED } from '../../bored';

// ── Tipos de pregunta ──
export type QuestionMode = 'classic' | 'sort' | 'match' | 'order' | 'choice' | 'truefalse' | 'sort3';
// sort=A | match=B | order=C | choice=D | truefalse=E | sort3=F

export interface SortItem {
  id: number;
  text: string;
  correctPanel: 'left' | 'right' | 'center';  // center = columna del medio en sort3
}

// Modo B — cada par conecta una opción izquierda (A/B/C) con una derecha (1/2/3)
export interface MatchOption {
  id: string;   // 'A','B','C' o '1','2','3'
  text: string;
}
export interface MatchPair {
  leftId: string;   // 'A'
  rightId: string;  // '2'
}

export interface QuizQuestion {
  id: number;
  mode: QuestionMode;
  text: string;
  // classic
  answer?: string;
  // sort (Modo A) / sort3 (Modo F)
  leftLabel?: string;
  centerLabel?: string;   // solo Modo F
  rightLabel?: string;
  items?: SortItem[];
  // match (Modo B)
  leftOptions?: MatchOption[];
  rightOptions?: MatchOption[];
  correctPairs?: MatchPair[];
  // order (Modo C)
  orderOptions?: OrderOption[];
  correctOrder?: string[];
  // choice (Modo D)
  choiceOptions?: ChoiceOption[];
  correctChoiceId?: string;
  // truefalse (Modo E) — la respuesta correcta es true (○) o false (✕)
  correctAnswer?: boolean;
  // Explicación que muestra el personaje tras responder
  explanationCorrect?: string;   // qué decir si acertó
  explanationWrong?: string;     // qué decir si falló (qué era lo correcto)
}

export interface OrderOption {
  id: string;
  text: string;
}

// Modo D — opción múltiple (1, 2, 3, 4)
export interface ChoiceOption {
  id: string;   // '1','2','3','4'
  text: string;
}

/*
 * ══════════════════════════════════════════════════════
 *  PREGUNTAS DEL QUIZ — edita solo aquí para cambiar el contenido
 *
 *  Modos disponibles:
 *   'sort'      (A) — chips al panel izquierdo o derecho
 *   'match'     (B) — conectar A/B/C con 1/2/3 mediante líneas
 *   'order'     (C) — ordenar opciones en la secuencia correcta
 *   'choice'    (D) — opción múltiple 1-4
 *   'truefalse' (E) — verdadero (✓ verde) o falso (✕ rojo)
 *   'sort3'     (F) — igual que sort pero con 3 paneles
 *   'classic'       — el profesor marca correcto/incorrecto manualmente
 * ══════════════════════════════════════════════════════
 */
// ══════════════════════════════════════════════════════
//  NIVEL 1 — "El Trigo Dorado"
// ══════════════════════════════════════════════════════
const QUESTIONS_1: QuizQuestion[] = [

  // ── Pregunta 1 · Modo E (Verdadero / Falso) ──────────────
  {
    id: 1, mode: 'truefalse',
    text: 'La disminución de ventas de "El Trigo Dorado" se debe únicamente a que su producto perdió calidad.',
    correctAnswer: false,
    explanationCorrect: '¡Correcto! La calidad se mantuvo. El problema es la falta de canales digitales y visibilidad frente a nuevos competidores.',
    explanationWrong: 'El texto dice que mantienen la misma calidad. El verdadero problema es la ausencia de presencia digital y delivery.',
  },

  // ── Pregunta 2 · Modo D (Opción múltiple) ────────────────
  {
    id: 2, mode: 'choice',
    text: '¿Cuál es la principal razón por la que los competidores de "El Trigo Dorado" están captando más clientes?',
    choiceOptions: [
      { id: '1', text: 'Sus productos son más baratos' },
      { id: '2', text: 'Ofrecen canales digitales: delivery y redes sociales' },
      { id: '3', text: 'Llevan más años en el mercado' },
      { id: '4', text: 'Tienen una ubicación más céntrica' },
    ],
    correctChoiceId: '2',
    explanationCorrect: '¡Exacto! Los competidores ampliaron su canal de distribución con delivery y construyeron presencia en redes sociales.',
    explanationWrong: 'La respuesta correcta es la opción 2: los competidores usan canales digitales como delivery y redes sociales para llegar a más clientes.',
  },

  // ── Pregunta 3 · Modo A (Clasificar) ─────────────────────
  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada acción según si ayuda o NO ayuda a solucionar el problema de "El Trigo Dorado"',
    leftLabel:  'Sí ayuda',
    rightLabel: 'No ayuda',
    items: [
      { id: 1, text: 'Crear perfil en redes sociales',        correctPanel: 'left' },
      { id: 2, text: 'Ofrecer pedidos por WhatsApp',           correctPanel: 'left' },
      { id: 3, text: 'Bajar la calidad del pan para ahorrar',  correctPanel: 'right' },
      { id: 4, text: 'Implementar servicio a domicilio',       correctPanel: 'left' },
      { id: 5, text: 'Ignorar a la competencia',               correctPanel: 'right' },
    ],
    explanationCorrect: '¡Muy bien! Las acciones digitales y el delivery amplían el alcance. Bajar calidad o ignorar la competencia son errores estratégicos.',
    explanationWrong: 'Las acciones que sí ayudan son las digitales: redes, WhatsApp y delivery. Bajar la calidad o ignorar la competencia solo agravan el problema.',
  },

  // ── Pregunta 4 · Modo C (Ordenar pasos) ──────────────────
  {
    id: 4, mode: 'order',
    text: 'Ordena los pasos que debería seguir "El Trigo Dorado" para adaptarse al mercado digital',
    orderOptions: [
      { id: 'A', text: 'Lanzar el servicio de delivery' },
      { id: 'B', text: 'Analizar a los competidores digitales' },
      { id: 'C', text: 'Crear contenido en redes sociales' },
    ],
    correctOrder: ['B', 'C', 'A'],
    explanationCorrect: '¡Perfecto! Primero analizar, luego construir presencia digital y finalmente lanzar el canal de venta.',
    explanationWrong: 'El orden correcto es: 1° Analizar competidores, 2° Crear contenido en redes sociales, 3° Lanzar delivery. Primero se diagnostica, luego se actúa.',
  },

  // ── Pregunta 5 · Modo B (Conectar) ───────────────────────
  {
    id: 5, mode: 'match',
    text: 'Conecta cada problema de la panadería con la variable de marketing que lo explica',
    leftOptions: [
      { id: 'A', text: 'Clientes no se enteran de ofertas' },
      { id: 'B', text: 'No llega a clientes fuera del barrio' },
      { id: 'C', text: 'Pérdida de ventas frente a competidores digitales' },
    ],
    rightOptions: [
      { id: '1', text: 'Plaza (distribución)' },
      { id: '2', text: 'Promoción' },
      { id: '3', text: 'Entorno competitivo' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '2' },
      { leftId: 'B', rightId: '1' },
      { leftId: 'C', rightId: '3' },
    ],
    explanationCorrect: '¡Excelente! Falta de comunicación → Promoción. No llegar lejos → Plaza. Competidores → Entorno competitivo.',
    explanationWrong: 'Las conexiones correctas son: "No se enteran de ofertas" → Promoción · "No llega lejos" → Plaza · "Pérdida ante competidores" → Entorno competitivo.',
  },

  // ── Pregunta 6 · Modo F (3 columnas) ─────────────────────
  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada acción según la variable de marketing a la que pertenece',
    leftLabel:   'Producto',
    centerLabel: 'Promoción',
    rightLabel:  'Plaza',
    items: [
      { id: 1, text: 'Mejorar el empaque del pan',       correctPanel: 'left' },
      { id: 2, text: 'Publicar fotos en Instagram',      correctPanel: 'center' },
      { id: 3, text: 'Habilitar pedidos por WhatsApp',   correctPanel: 'right' },
      { id: 4, text: 'Agregar nuevos sabores',           correctPanel: 'left' },
      { id: 5, text: 'Hacer promociones en Facebook',    correctPanel: 'center' },
      { id: 6, text: 'Ofrecer servicio a domicilio',     correctPanel: 'right' },
    ],
    explanationCorrect: '¡Genial! Empaque y nuevos sabores son Producto. Publicar y promocionar en redes es Promoción. WhatsApp y delivery son Plaza.',
    explanationWrong: 'Recuerda: Producto = características físicas (empaque, sabores). Promoción = comunicación (redes, publicidad). Plaza = cómo llega al cliente (delivery, WhatsApp).',
  },

];

// ══════════════════════════════════════════════════════
//  NIVEL 2 — "Bebida Energética Natural"
//  Contexto: empresa con nuevo producto saludable que no sabe
//  si hay mercado ni cuánto cobrar.
// ══════════════════════════════════════════════════════
const QUESTIONS_2: QuizQuestion[] = [

  // ── Pregunta 1 · Modo E (Verdadero / Falso) ──────────────
  {
    id: 1, mode: 'truefalse',
    text: 'Antes de lanzar la bebida al mercado, la empresa debería investigar si los consumidores realmente están interesados en el producto.',
    correctAnswer: true,
    explanationCorrect: 'Exactamente. Nadie debería invertir sin saber si hay alguien dispuesto a comprar, ¿verdad? Investigar primero es la decisión más inteligente.',
    explanationWrong: 'Piénsalo bien: lanzar sin investigar es como adivinar. La empresa necesita saber si hay demanda real antes de gastar todo ese dinero.',
  },

  // ── Pregunta 2 · Modo D (Opción múltiple) ────────────────
  {
    id: 2, mode: 'choice',
    text: '¿Cuál es el segmento de mercado principal al que apunta la bebida energética natural?',
    choiceOptions: [
      { id: '1', text: 'Adultos mayores y jubilados' },
      { id: '2', text: 'Estudiantes universitarios y deportistas' },
      { id: '3', text: 'Niños en edad escolar' },
      { id: '4', text: 'Empleados del sector bancario' },
    ],
    correctChoiceId: '2',
    explanationCorrect: '¡Así es! Quienes más buscan energía natural y cuidan su salud son los estudiantes y deportistas. Es el público perfecto para esta bebida.',
    explanationWrong: 'Fíjate en el contexto: habla de estudiantes, deportistas y personas que buscan opciones saludables. Ese es exactamente el público que necesitan conquistar.',
  },

  // ── Pregunta 3 · Modo A (Clasificar) ─────────────────────
  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada interrogante según si es una duda de PRECIO o de PRODUCTO para la empresa',
    leftLabel:  'Precio',
    rightLabel: 'Producto',
    items: [
      { id: 1, text: '¿Cuánto pagarían los clientes?',     correctPanel: 'left' },
      { id: 2, text: '¿Qué sabores prefieren?',            correctPanel: 'right' },
      { id: 3, text: '¿Es demasiado caro vs la competencia?', correctPanel: 'left' },
      { id: 4, text: '¿Sin conservantes es valorado?',     correctPanel: 'right' },
    ],
    explanationCorrect: '¡Bien pensado! Todo lo que tiene que ver con dinero y comparar costos va a Precio. Lo del sabor y los ingredientes, eso es hablar del producto en sí.',
    explanationWrong: 'Una pista: si la pregunta habla de dinero o de comparar con la competencia, es de Precio. Si habla de sabor, ingredientes o características, es de Producto.',
  },

  // ── Pregunta 4 · Modo C (Ordenar pasos) ──────────────────
  {
    id: 4, mode: 'order',
    text: 'Ordena los pasos que debería seguir la empresa antes de lanzar la bebida al mercado',
    orderOptions: [
      { id: 'A', text: 'Producir en masa y distribuir' },
      { id: 'B', text: 'Realizar encuestas y grupos focales' },
      { id: 'C', text: 'Analizar a la competencia en el mercado' },
    ],
    correctOrder: ['C', 'B', 'A'],
    explanationCorrect: '¡Justo así! Primero hay que ver qué hace la competencia, luego escuchar a los consumidores, y solo después salir a producir con confianza.',
    explanationWrong: 'El truco está en no apresurarse. Hay que entender el mercado y escuchar a los clientes antes de invertir en producción. Analizar → Investigar → Producir.',
  },

  // ── Pregunta 5 · Modo B (Conectar) ───────────────────────
  {
    id: 5, mode: 'match',
    text: 'Conecta cada riesgo con la variable de marketing que lo origina',
    leftOptions: [
      { id: 'A', text: 'No saben cuánto cobrar por la bebida' },
      { id: 'B', text: 'No saben si llegarán al público objetivo' },
      { id: 'C', text: 'No saben si el sabor gustará' },
    ],
    rightOptions: [
      { id: '1', text: 'Producto' },
      { id: '2', text: 'Precio' },
      { id: '3', text: 'Plaza' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '2' },
      { leftId: 'B', rightId: '3' },
      { leftId: 'C', rightId: '1' },
    ],
    explanationCorrect: '¡Muy bien conectado! El dinero va a Precio, llegar al cliente es la Plaza, y lo que ofreces es el Producto. Las 4P en acción.',
    explanationWrong: 'Piénsalo así: cuánto cobrar → Precio. Cómo y dónde venderlo → Plaza. Qué tan bueno es lo que ofreces → Producto.',
  },

  // ── Pregunta 6 · Modo F (3 columnas) ─────────────────────
  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada acción en la etapa de lanzamiento que corresponde',
    leftLabel:   'Investigación',
    centerLabel: 'Desarrollo',
    rightLabel:  'Lanzamiento',
    items: [
      { id: 1, text: 'Encuestar a estudiantes universitarios', correctPanel: 'left' },
      { id: 2, text: 'Formular el producto sin conservantes',  correctPanel: 'center' },
      { id: 3, text: 'Publicar anuncios en redes sociales',    correctPanel: 'right' },
      { id: 4, text: 'Analizar precios de la competencia',     correctPanel: 'left' },
      { id: 5, text: 'Probar sabores con grupos focales',      correctPanel: 'center' },
      { id: 6, text: 'Distribuir en tiendas y gimnasios',      correctPanel: 'right' },
    ],
    explanationCorrect: 'Muy bien organizado. Primero recopilas datos, luego construyes el producto, y al final lo sacas al mundo. Ese es el flujo natural de cualquier lanzamiento.',
    explanationWrong: 'Recuerda el orden lógico: preguntar y analizar es Investigación; crear y probar es Desarrollo; salir a vender y comunicar es el Lanzamiento.',
  },

];

// ══════════════════════════════════════════════════════
//  NIVEL 3 — "Restaurante Familiar"
//  Contexto: restaurante con buena comida pero mala atención
//  que está perdiendo clientes por reseñas negativas.
// ══════════════════════════════════════════════════════
const QUESTIONS_3: QuizQuestion[] = [

  // ── Pregunta 1 · Modo E (Verdadero / Falso) ──────────────
  {
    id: 1, mode: 'truefalse',
    text: 'El problema principal del restaurante es que la calidad de la comida ha disminuido.',
    correctAnswer: false,
    explanationCorrect: 'Exacto, y lo dice el texto claramente: la comida sigue siendo buena. Aquí el problema no es lo que sirven sino cómo lo sirven.',
    explanationWrong: 'Ojo, el texto dice que la comida sigue siendo buena. El problema real está en la forma en que tratan a los clientes, no en la receta.',
  },

  // ── Pregunta 2 · Modo D (Opción múltiple) ────────────────
  {
    id: 2, mode: 'choice',
    text: '¿Cuál de estas acciones ayudaría más a recuperar la confianza de los clientes del restaurante?',
    choiceOptions: [
      { id: '1', text: 'Subir los precios del menú' },
      { id: '2', text: 'Capacitar al personal en servicio al cliente' },
      { id: '3', text: 'Reducir la variedad de platos' },
      { id: '4', text: 'Cerrar las redes sociales del restaurante' },
    ],
    correctChoiceId: '2',
    explanationCorrect: 'Tiene todo el sentido. Si el problema viene del personal, la solución empieza por ahí. Un equipo bien capacitado cambia por completo la experiencia del cliente.',
    explanationWrong: 'Piénsalo: las quejas son sobre el trato, los tiempos y los errores. Nada de eso se soluciona subiendo precios o cerrando redes. Hay que trabajar con el equipo.',
  },

  // ── Pregunta 3 · Modo A (Clasificar) ─────────────────────
  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada problema según si es una falla en el SERVICIO o en la COMUNICACIÓN del restaurante',
    leftLabel:  'Servicio',
    rightLabel: 'Comunicación',
    items: [
      { id: 1, text: 'Largos tiempos de espera',          correctPanel: 'left' },
      { id: 2, text: 'Reseñas negativas sin responder',   correctPanel: 'right' },
      { id: 3, text: 'Errores frecuentes en las órdenes', correctPanel: 'left' },
      { id: 4, text: 'Sin presencia activa en redes',     correctPanel: 'right' },
      { id: 5, text: 'Atención poco cordial',             correctPanel: 'left' },
    ],
    explanationCorrect: 'Bien visto. Lo que pasa adentro del restaurante, lo que el cliente vive en persona, eso es Servicio. Lo que el negocio comunica hacia afuera, eso es Comunicación.',
    explanationWrong: 'La clave está en preguntarte: ¿ocurre dentro del restaurante? → Servicio. ¿Es cómo el negocio habla con el mundo? → Comunicación.',
  },

  // ── Pregunta 4 · Modo C (Ordenar pasos) ──────────────────
  {
    id: 4, mode: 'order',
    text: 'Ordena los pasos que debería seguir el restaurante para recuperar su reputación',
    orderOptions: [
      { id: 'A', text: 'Responder públicamente las reseñas negativas' },
      { id: 'B', text: 'Identificar los problemas de atención internos' },
      { id: 'C', text: 'Capacitar al personal y mejorar procesos' },
    ],
    correctOrder: ['B', 'C', 'A'],
    explanationCorrect: 'Tiene mucho sentido, ¿no? No puedes responderle al público que mejoraste si aún no has mejorado nada. Primero se trabaja por dentro, luego se comunica hacia afuera.',
    explanationWrong: 'No se puede comunicar una mejora que aún no existe. Primero identificar el problema, luego resolverlo, y recién ahí contarle al mundo que cambiaron.',
  },

  // ── Pregunta 5 · Modo B (Conectar) ───────────────────────
  {
    id: 5, mode: 'match',
    text: 'Conecta cada queja de los clientes con el elemento de servicio al cliente que falla',
    leftOptions: [
      { id: 'A', text: '"Espero 40 minutos por mi pedido"' },
      { id: 'B', text: '"Me trajeron el plato equivocado"' },
      { id: 'C', text: '"El mesero fue muy grosero"' },
    ],
    rightOptions: [
      { id: '1', text: 'Actitud del personal' },
      { id: '2', text: 'Tiempo de respuesta' },
      { id: '3', text: 'Exactitud del pedido' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '2' },
      { leftId: 'B', rightId: '3' },
      { leftId: 'C', rightId: '1' },
    ],
    explanationCorrect: 'Perfectamente identificado. Cada queja apunta a algo distinto: la velocidad, la precisión y la actitud. Son tres problemas que se deben atacar por separado.',
    explanationWrong: 'Escucha la queja y pregúntate qué falló: ¿tardó mucho? → Tiempo. ¿Llegó mal? → Exactitud. ¿Fue grosero? → Actitud. Cada una tiene su causa específica.',
  },

  // ── Pregunta 6 · Modo F (3 columnas) ─────────────────────
  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada acción según el área del restaurante que mejora',
    leftLabel:   'Atención',
    centerLabel: 'Procesos',
    rightLabel:  'Reputación',
    items: [
      { id: 1, text: 'Capacitar al personal en trato al cliente', correctPanel: 'left' },
      { id: 2, text: 'Implementar sistema de toma de pedidos',    correctPanel: 'center' },
      { id: 3, text: 'Responder reseñas en redes sociales',       correctPanel: 'right' },
      { id: 4, text: 'Establecer tiempos máximos de espera',      correctPanel: 'center' },
      { id: 5, text: 'Crear protocolo de saludo a los clientes',  correctPanel: 'left' },
      { id: 6, text: 'Publicar mejoras realizadas en Instagram',  correctPanel: 'right' },
    ],
    explanationCorrect: 'Excelente clasificación. Cómo trata el personal es Atención, cómo funcionan por dentro es Proceso, y cómo lo cuentan al mundo es Reputación.',
    explanationWrong: 'Una forma fácil de recordarlo: Atención es cara a cara con el cliente, Procesos es la cocina interna del negocio, y Reputación es la imagen que proyectan.',
  },

];

// ══════════════════════════════════════════════════════
//  NIVEL 4 — "Café Premium"
//  Contexto: empresa exitosa que quiere expandirse a otra
//  ciudad sin conocer los hábitos ni la competencia local.
// ══════════════════════════════════════════════════════
const QUESTIONS_4: QuizQuestion[] = [

  {
    id: 1, mode: 'truefalse',
    text: 'El hecho de que la empresa haya tenido éxito en su ciudad de origen garantiza que tendrá el mismo éxito en la nueva ciudad.',
    correctAnswer: false,
    explanationCorrect: 'Exactamente. El éxito en un mercado no se transfiere automáticamente a otro. Los hábitos, la competencia y la cultura pueden ser muy diferentes.',
    explanationWrong: 'No tan rápido. Cada mercado es distinto. Lo que funcionó en casa no siempre funciona fuera, especialmente si no conoces los gustos y costumbres del nuevo lugar.',
  },

  {
    id: 2, mode: 'choice',
    text: '¿Cuál es el mayor riesgo que enfrenta la empresa al expandirse sin investigar el nuevo mercado?',
    choiceOptions: [
      { id: '1', text: 'Que el café llegue en mal estado por la distancia' },
      { id: '2', text: 'Invertir recursos importantes en un mercado desconocido y obtener malos resultados' },
      { id: '3', text: 'Que los empleados actuales renuncien por el cambio' },
      { id: '4', text: 'Que los precios suban por la logística' },
    ],
    correctChoiceId: '2',
    explanationCorrect: 'Justo eso. Años de trabajo pueden comprometerse si se invierte a ciegas. Por eso conocer el mercado antes de entrar es tan importante.',
    explanationWrong: 'El riesgo principal no es logístico ni de personal, es estratégico. Invertir dinero acumulado en un mercado que no conoces bien puede salir muy caro.',
  },

  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada acción según si corresponde a ANTES o DESPUÉS de tomar la decisión de expansión',
    leftLabel:  'Antes de decidir',
    rightLabel: 'Después de decidir',
    items: [
      { id: 1, text: 'Investigar hábitos de consumo en la nueva ciudad', correctPanel: 'left' },
      { id: 2, text: 'Contratar personal local',                          correctPanel: 'right' },
      { id: 3, text: 'Analizar las marcas líderes en esa región',         correctPanel: 'left' },
      { id: 4, text: 'Establecer puntos de distribución',                 correctPanel: 'right' },
      { id: 5, text: 'Estudiar diferencias culturales del nuevo mercado', correctPanel: 'left' },
    ],
    explanationCorrect: 'Bien razonado. Primero entiendes el terreno, y solo después empiezas a mover piezas. Invertir antes de investigar es jugar a ciegas.',
    explanationWrong: 'La secuencia importa mucho. Todo lo que tenga que ver con conocer el mercado va antes de decidir. Lo operativo viene después de tomar la decisión con información.',
  },

  {
    id: 4, mode: 'order',
    text: 'Ordena los pasos que debería seguir la empresa para una expansión exitosa',
    orderOptions: [
      { id: 'A', text: 'Abrir el primer punto de venta en la nueva ciudad' },
      { id: 'B', text: 'Diseñar la estrategia de marketing para ese mercado' },
      { id: 'C', text: 'Investigar hábitos y competencia en la nueva región' },
    ],
    correctOrder: ['C', 'B', 'A'],
    explanationCorrect: 'Exactamente ese orden. Sin información no hay buena estrategia, y sin estrategia abrir un local es solo gastar dinero y esperar suerte.',
    explanationWrong: 'No se puede diseñar una estrategia sin datos, ni abrir una tienda sin estrategia. El orden lógico es: investigar → planear → ejecutar.',
  },

  {
    id: 5, mode: 'match',
    text: 'Conecta cada desafío de la expansión con el área de marketing que lo debe resolver',
    leftOptions: [
      { id: 'A', text: 'No conocen los gustos del nuevo consumidor' },
      { id: 'B', text: 'No saben cómo distribuir el café en la nueva ciudad' },
      { id: 'C', text: 'No tienen visibilidad de marca en esa región' },
    ],
    rightOptions: [
      { id: '1', text: 'Plaza (distribución)' },
      { id: '2', text: 'Investigación de mercado' },
      { id: '3', text: 'Promoción' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '2' },
      { leftId: 'B', rightId: '1' },
      { leftId: 'C', rightId: '3' },
    ],
    explanationCorrect: 'Bien conectado. No conocer al consumidor requiere investigar. No saber cómo llegar es un problema de Plaza. No tener visibilidad es un problema de Promoción.',
    explanationWrong: 'Piénsalo así: ¿quién es el cliente? → Investigación. ¿Cómo llega el producto? → Plaza. ¿Cómo me conocen? → Promoción.',
  },

  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada factor según si representa una ventaja, un riesgo o una necesidad para la expansión',
    leftLabel:   'Ventaja',
    centerLabel: 'Riesgo',
    rightLabel:  'Necesidad',
    items: [
      { id: 1, text: 'Tener experiencia y calidad probada',          correctPanel: 'left' },
      { id: 2, text: 'Desconocer los hábitos del nuevo mercado',     correctPanel: 'center' },
      { id: 3, text: 'Invertir en investigación antes de entrar',    correctPanel: 'right' },
      { id: 4, text: 'Contar con clientes fieles en origen',         correctPanel: 'left' },
      { id: 5, text: 'Competencia local ya establecida en la zona',  correctPanel: 'center' },
      { id: 6, text: 'Adaptar el producto a la cultura local',       correctPanel: 'right' },
    ],
    explanationCorrect: 'Muy bien organizado. La experiencia y los clientes son ventajas reales. Lo desconocido y la competencia son riesgos. Y lo que hay que hacer sí o sí son las necesidades.',
    explanationWrong: 'Recuerda: lo que ya tienes y te beneficia → Ventaja. Lo que puede salir mal → Riesgo. Lo que no puedes evitar hacer si quieres tener éxito → Necesidad.',
  },

];

// ══════════════════════════════════════════════════════
//  NIVEL 5 — "Tienda Deportiva"
//  Contexto: campaña publicitaria digital con muchas vistas
//  pero pocas ventas reales. ROI decepcionante.
// ══════════════════════════════════════════════════════
const QUESTIONS_5: QuizQuestion[] = [

  {
    id: 1, mode: 'truefalse',
    text: 'Si miles de personas vieron y compartieron los anuncios de la tienda, podemos concluir que la campaña fue un éxito.',
    correctAnswer: false,
    explanationCorrect: 'Exacto. Muchas vistas no garantizan muchas ventas. El éxito de una campaña se mide por resultados concretos, no solo por el alcance.',
    explanationWrong: 'Tener muchas vistas es solo el primer paso. Si esas vistas no se convierten en compras, la campaña no logró su objetivo principal.',
  },

  {
    id: 2, mode: 'choice',
    text: '¿Cuál es la causa más probable de que la campaña no haya generado las ventas esperadas?',
    choiceOptions: [
      { id: '1', text: 'Los anuncios eran demasiado llamativos y molestaban a los usuarios' },
      { id: '2', text: 'La publicidad no estaba bien dirigida al público que realmente compra' },
      { id: '3', text: 'La tienda no tenía suficiente stock durante la campaña' },
      { id: '4', text: 'Las redes sociales tienen muy poco alcance para ese tipo de producto' },
    ],
    correctChoiceId: '2',
    explanationCorrect: 'Eso es. Ver un anuncio no significa que esa persona tenga intención de comprar. Si no llegas al público correcto, el dinero se va sin retorno.',
    explanationWrong: 'El problema clásico de la publicidad digital mal segmentada: muchos impactos, pocos compradores. Si el mensaje llega a quien no compra, el esfuerzo no se convierte en ventas.',
  },

  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada indicador según si mide el ALCANCE de la campaña o el RESULTADO comercial real',
    leftLabel:  'Alcance',
    rightLabel: 'Resultado comercial',
    items: [
      { id: 1, text: 'Número de visualizaciones del anuncio',  correctPanel: 'left' },
      { id: 2, text: 'Ventas generadas durante la campaña',    correctPanel: 'right' },
      { id: 3, text: 'Cantidad de likes e interacciones',      correctPanel: 'left' },
      { id: 4, text: 'Retorno de la inversión (ROI)',          correctPanel: 'right' },
      { id: 5, text: 'Clientes nuevos que compraron',          correctPanel: 'right' },
    ],
    explanationCorrect: 'Bien diferenciado. Ver, dar like o compartir es alcance. Comprar, convertirse en cliente o generar ganancia, eso sí son resultados.',
    explanationWrong: 'Los números grandes de vistas y likes se ven bien, pero no pagan las facturas. Los resultados comerciales son los que sí importan para el negocio.',
  },

  {
    id: 4, mode: 'order',
    text: 'Ordena los pasos para diseñar una campaña publicitaria digital más efectiva',
    orderOptions: [
      { id: 'A', text: 'Publicar los anuncios en plataformas digitales' },
      { id: 'B', text: 'Definir el público objetivo y sus hábitos de compra' },
      { id: 'C', text: 'Crear el mensaje y el contenido de la campaña' },
    ],
    correctOrder: ['B', 'C', 'A'],
    explanationCorrect: 'Así es. Primero conoces a quién le hablas, luego construyes el mensaje para esa persona, y recién ahí lo publicas. Sin ese orden, estás tirando al aire.',
    explanationWrong: 'No tiene sentido crear un anuncio sin saber para quién es, ni publicarlo sin haberlo construido bien. El orden correcto: definir audiencia → crear mensaje → publicar.',
  },

  {
    id: 5, mode: 'match',
    text: 'Conecta cada error de la campaña con el concepto de marketing que se ignoró',
    leftOptions: [
      { id: 'A', text: 'Los anuncios llegaron a personas que no compran artículos deportivos' },
      { id: 'B', text: 'No se midió si las visitas al sitio web terminaban en compra' },
      { id: 'C', text: 'El mensaje no explicaba claramente por qué elegir esta tienda' },
    ],
    rightOptions: [
      { id: '1', text: 'Propuesta de valor' },
      { id: '2', text: 'Segmentación de mercado' },
      { id: '3', text: 'Conversión y métricas' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '2' },
      { leftId: 'B', rightId: '3' },
      { leftId: 'C', rightId: '1' },
    ],
    explanationCorrect: 'Perfectamente identificado. Llegar a quien no compra es falla de segmentación. No medir resultados es ignorar las métricas. No explicar el diferencial es no tener propuesta de valor.',
    explanationWrong: 'Cada error tiene su nombre: audiencia equivocada → Segmentación. Sin medir conversiones → Métricas. Sin explicar por qué elegirte → Propuesta de valor.',
  },

  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada acción según si mejoraría la SEGMENTACIÓN, el MENSAJE o la MEDICIÓN de la campaña',
    leftLabel:   'Segmentación',
    centerLabel: 'Mensaje',
    rightLabel:  'Medición',
    items: [
      { id: 1, text: 'Definir el perfil del comprador ideal',         correctPanel: 'left' },
      { id: 2, text: 'Comunicar claramente los beneficios del producto', correctPanel: 'center' },
      { id: 3, text: 'Instalar píxeles de seguimiento en el sitio web', correctPanel: 'right' },
      { id: 4, text: 'Filtrar la audiencia por intereses deportivos', correctPanel: 'left' },
      { id: 5, text: 'Usar imágenes y textos que conecten con el deporte', correctPanel: 'center' },
      { id: 6, text: 'Analizar el costo por venta generada',          correctPanel: 'right' },
    ],
    explanationCorrect: 'Excelente. A quién le llegas → Segmentación. Qué les dices y cómo → Mensaje. Si está funcionando → Medición. Esas tres áreas juntas hacen una buena campaña.',
    explanationWrong: 'Una campaña efectiva cuida tres cosas: a quién llega (Segmentación), qué dice (Mensaje) y cómo sabe que funciona (Medición). Ubica cada acción en su área.',
  },

];

// ══════════════════════════════════════════════════════
//  NIVEL 6 — "Supermercado Local"
//  Contexto: supermercado familiar amenazado por la apertura
//  de una cadena nacional con más recursos y promociones.
// ══════════════════════════════════════════════════════
const QUESTIONS_6: QuizQuestion[] = [

  {
    id: 1, mode: 'truefalse',
    text: 'La mejor estrategia para el supermercado local es intentar competir directamente con las mismas promociones y precios de la cadena nacional.',
    correctAnswer: false,
    explanationCorrect: 'Correcto. Un negocio pequeño no puede ganar una guerra de precios contra una cadena grande. La clave está en diferenciarse, no en copiar.',
    explanationWrong: 'Competir con los mismos recursos de una cadena nacional es una batalla perdida. El supermercado local debe encontrar lo que lo hace único, no intentar ser lo que no puede ser.',
  },

  {
    id: 2, mode: 'choice',
    text: '¿Cuál es la principal ventaja competitiva que tiene el supermercado local frente a la cadena nacional?',
    choiceOptions: [
      { id: '1', text: 'Tiene precios más bajos en todos sus productos' },
      { id: '2', text: 'El conocimiento profundo de su comunidad y la relación con los clientes habituales' },
      { id: '3', text: 'Sus instalaciones son más modernas y atractivas' },
      { id: '4', text: 'Ofrece una mayor variedad de productos importados' },
    ],
    correctChoiceId: '2',
    explanationCorrect: 'Exactamente eso. Una cadena nueva no puede replicar en semanas lo que un negocio local construyó en una década: confianza y cercanía con su comunidad.',
    explanationWrong: 'La cadena gana en precio, variedad e instalaciones. Pero hay algo que no puede comprar: la relación humana y el conocimiento de la comunidad que el local ya tiene.',
  },

  {
    id: 3, mode: 'sort',
    text: 'Clasifica cada estrategia según si sirve para DIFERENCIARSE o para RETENER a los clientes actuales',
    leftLabel:  'Diferenciarse',
    rightLabel: 'Retener clientes',
    items: [
      { id: 1, text: 'Ofrecer productos locales que la cadena no tiene',   correctPanel: 'left' },
      { id: 2, text: 'Crear programa de puntos para clientes frecuentes',  correctPanel: 'right' },
      { id: 3, text: 'Especializar la oferta en productos regionales',     correctPanel: 'left' },
      { id: 4, text: 'Reconocer a los clientes por nombre y preferencias', correctPanel: 'right' },
      { id: 5, text: 'Ofrecer servicio de pedidos personalizados',         correctPanel: 'right' },
    ],
    explanationCorrect: 'Bien clasificado. Diferenciarse es construir algo que el otro no tiene. Retener es cuidar lo que ya tienes. Ambas cosas son necesarias al mismo tiempo.',
    explanationWrong: 'Diferenciarse es crear una razón para elegirte sobre los demás. Retener es darle a los clientes actuales una razón para no irse. Son dos frentes distintos.',
  },

  {
    id: 4, mode: 'order',
    text: 'Ordena las acciones que debería tomar el supermercado para responder a la nueva competencia',
    orderOptions: [
      { id: 'A', text: 'Comunicar a los clientes habituales las mejoras realizadas' },
      { id: 'B', text: 'Identificar qué valoran más los clientes del supermercado local' },
      { id: 'C', text: 'Mejorar la experiencia y el servicio en base a esos valores' },
    ],
    correctOrder: ['B', 'C', 'A'],
    explanationCorrect: 'Ese es el orden correcto. Primero escuchar, luego actuar en base a lo que escuchaste, y recién entonces contarle al mundo lo que hiciste.',
    explanationWrong: 'No puedes comunicar mejoras antes de hacerlas, ni hacerlas sin saber qué importa. El camino es: escuchar → mejorar → comunicar.',
  },

  {
    id: 5, mode: 'match',
    text: 'Conecta cada ventaja del supermercado local con el elemento de marketing que la fortalece',
    leftOptions: [
      { id: 'A', text: 'Conoce a sus clientes por nombre y preferencias' },
      { id: 'B', text: 'Puede ofrecer productos locales y artesanales' },
      { id: 'C', text: 'Tiene años de presencia en el barrio' },
    ],
    rightOptions: [
      { id: '1', text: 'Imagen y reputación de marca' },
      { id: '2', text: 'Diferenciación de producto' },
      { id: '3', text: 'Relación personalizada con el cliente' },
    ],
    correctPairs: [
      { leftId: 'A', rightId: '3' },
      { leftId: 'B', rightId: '2' },
      { leftId: 'C', rightId: '1' },
    ],
    explanationCorrect: 'Bien visto. Conocer al cliente es personalización. Tener lo que la cadena no tiene es diferenciación. Y llevar años en el barrio es reputación ganada.',
    explanationWrong: 'El trato personal → Relación con el cliente. Los productos únicos → Diferenciación. Los años de trayectoria → Reputación. Esas son las tres armas del negocio local.',
  },

  {
    id: 6, mode: 'sort3',
    text: 'Clasifica cada acción según si fortalece la FIDELIZACIÓN, la DIFERENCIACIÓN o la COMUNICACIÓN del supermercado',
    leftLabel:   'Fidelización',
    centerLabel: 'Diferenciación',
    rightLabel:  'Comunicación',
    items: [
      { id: 1, text: 'Tarjeta de descuentos para clientes frecuentes',    correctPanel: 'left' },
      { id: 2, text: 'Vender productos artesanales del barrio',           correctPanel: 'center' },
      { id: 3, text: 'Publicar en redes lo que hace especial al local',   correctPanel: 'right' },
      { id: 4, text: 'Recordar los pedidos habituales de cada cliente',   correctPanel: 'left' },
      { id: 5, text: 'Ofrecer cortes de carne personalizados',            correctPanel: 'center' },
      { id: 6, text: 'Enviar mensajes con promociones a clientes fijos',  correctPanel: 'right' },
    ],
    explanationCorrect: 'Perfecto. Fidelizar es hacer que los que ya te conocen se queden. Diferenciarse es ofrecer algo que no encuentran en otro lado. Comunicar es contarle al mundo por qué elegirte.',
    explanationWrong: 'Piénsalo así: lo que hace que un cliente vuelva → Fidelización. Lo que te hace único → Diferenciación. Lo que te hace visible y relevante → Comunicación.',
  },

];

// ── Mapa global de preguntas por nivel ──
const QUESTIONS_BY_LEVEL: Record<number, QuizQuestion[]> = {
  1: QUESTIONS_1,
  2: QUESTIONS_2,
  3: QUESTIONS_3,
  4: QUESTIONS_4,
  5: QUESTIONS_5,
  6: QUESTIONS_6,
};

// Fallback: usa nivel 1 si no hay preguntas para el nivel solicitado
function getQuestions(levelId: number): QuizQuestion[] {
  return QUESTIONS_BY_LEVEL[levelId] ?? QUESTIONS_1;
}

const TIMER_SECONDS = 59;

// ── Comentarios del personaje por situación ──
const COMMENTS: Record<string, string[]> = {
  start: [
    '¡Ánimo! Vamos a demostrar lo que sabes.',
    '¡Tú puedes! Confía en ti.',
    'Cada pregunta es una nueva oportunidad.',
  ],
  correct: [
    '¡Excelente! Eso es gestión de mercados.',
    '¡Muy bien! Sigue así.',
    '¡Correcto! Tienes buen ojo.',
    '¡Genial! Lo tenías claro.',
  ],
  wrong: [
    '¡No pasa nada! La siguiente es tuya.',
    'Tranquilo, esto te ayuda a aprender más.',
    '¡Casi! Ya lo tendrás en la próxima.',
    'Cada error es un paso hacia el conocimiento.',
  ],
  slow: [
    '¡Confía en tu instinto! Ya casi se acaba el tiempo.',
    '¡Vamos, tú lo sabes! Decide con confianza.',
    '¡Ánimo! El tiempo corre pero tú puedes.',
  ],
  streak_correct: [
    '¡Racha impresionante! Eres increíble.',
    '¡Tres seguidas! Estás en llamas 🔥',
    '¡Imparable! Sigue así.',
  ],
  streak_wrong: [
    '¡Respira! La próxima la tienes segura.',
    '¡Sé positivo! Puedes remontar perfectamente.',
    '¡Ánimo! Lo importante es seguir intentándolo.',
  ],
  almost_done: [
    '¡Casi terminamos! Dale todo en las últimas.',
    '¡Una más! Lo has hecho muy bien.',
    '¡Al final! Cierra con todo.',
  ],
  finished_great: [
    '¡Extraordinario! Dominas este tema.',
    '¡Perfecto! Eso es lo que se llama preparación.',
  ],
  finished_good: [
    '¡Bien hecho! Tienes una base sólida.',
    '¡Muy bien! Con un poco más de práctica serás experto.',
  ],
  finished_ok: [
    '¡Lo lograste! Cada intento te hace más fuerte.',
    '¡Buen esfuerzo! Ya sabes qué repasar.',
  ],
};

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type QuizPhase = 'question' | 'reveal' | 'finished';

export interface QuizResult {
  questionId: number;
  correct: boolean;
}

@Component({
  selector: 'app-quiz',
  imports: [CommonModule, QuizModeA, QuizModeB, QuizModeC, QuizModeD, QuizModeE],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
  animations: [
    trigger('questionEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-40px) scale(0.96)' }),
        animate('450ms cubic-bezier(0.34,1.3,0.64,1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in',
          style({ opacity: 0, transform: 'translateY(40px) scale(0.96)' })),
      ]),
    ]),
    trigger('answerEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleX(0.4)' }),
        animate('400ms 200ms cubic-bezier(0.34,1.4,0.64,1)',
          style({ opacity: 1, transform: 'scaleX(1)' })),
      ]),
    ]),
    trigger('resultPop', [
      transition(':enter', [
        animate('500ms cubic-bezier(0.34,1.6,0.64,1)', keyframes([
          style({ opacity: 0, transform: 'scale(0)',    offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.35)', offset: 0.65 }),
          style({ opacity: 1, transform: 'scale(1)',    offset: 1 }),
        ])),
      ]),
    ]),
    trigger('chipEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0) rotate(-45deg)' }),
        animate('350ms cubic-bezier(0.34,1.5,0.64,1)',
          style({ opacity: 1, transform: 'scale(1) rotate(0)' })),
      ]),
    ]),
    trigger('finishedEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('600ms cubic-bezier(0.34,1.2,0.64,1)',
          style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('commentSwap', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.95)' }),
        animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' })),
      ]),
    ]),
    trigger('announcerPop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(60px)' }),
        animate('600ms cubic-bezier(0.34,1.4,0.64,1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('contextModal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92) translateY(-20px)' }),
        animate('320ms cubic-bezier(0.34,1.2,0.64,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
})
export class Quiz implements OnInit, OnDestroy {
  readonly isBored = IS_BORED;

  @Input() levelId = 1;
  @Input() levelTitle = '';
  @Input() levelContext = '';
  @Output() exit = new EventEmitter<void>();
  @Output() spaceModeChange = new EventEmitter<'fast' | 'faster' | 'chaos'>();

  isMobileLayout = signal(this.checkMobile());

  private checkMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerHeight <= 620 && window.innerWidth > window.innerHeight;
  }

  private resizeListener = () => this.isMobileLayout.set(this.checkMobile());

  get announcerImage(): string {
    return `images/thinking/${this.levelId}.png`;
  }

  questions: QuizQuestion[] = [];
  totalQuestions = 0;
  timerTotal = TIMER_SECONDS;

  phase = signal<QuizPhase>('question');
  currentIndex = signal(0);
  timerValue = signal(TIMER_SECONDS);
  results = signal<QuizResult[]>([]);
  lastCorrect = signal<boolean | null>(null);
  showResult   = signal(false);
  showContext  = signal(false);

  // Typewriter de la pregunta
  displayedQuestion = signal('');
  isTypingQuestion  = signal(false);

  // Comentarista
  comment = signal(pick(COMMENTS['start']));
  commentKey = signal(0);
  showComment = signal(true);
  private commentTimeout: any = null;
  slowWarned = false;

  private timerInterval: any = null;
  private typeInterval: any = null;

  currentQuestion = computed(() => this.questions[this.currentIndex()]);
  isLastQuestion  = computed(() => this.currentIndex() === this.totalQuestions - 1);
  timerPercent    = computed(() => (this.timerValue() / this.timerTotal) * 100);

  timerColor = computed(() => {
    const p = this.timerPercent();
    if (p > 50) return '#22d3ee';
    if (p > 25) return '#facc15';
    return '#ef4444';
  });

  readonly CIRCUMFERENCE = 214;  // 2π × r34 ≈ 213.6
  timerDash = computed(() => {
    const filled = (this.timerValue() / this.timerTotal) * this.CIRCUMFERENCE;
    return `${filled} ${this.CIRCUMFERENCE}`;
  });

  correctCount   = computed(() => this.results().filter(r => r.correct).length);
  incorrectCount = computed(() => this.results().filter(r => !r.correct).length);
  emptySlots     = computed(() =>
    Array.from({ length: this.totalQuestions - this.results().length }, (_, i) => i)
  );

  ngOnInit() {
    window.addEventListener('resize', this.resizeListener);
    this.questions = getQuestions(this.levelId);
    this.totalQuestions = this.questions.length;
    this.typeQuestion();
    this.startTimer();
    this.emitSpaceMode();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    this.clearTimer();
    this.clearTypeInterval();
    if (this.commentTimeout) clearTimeout(this.commentTimeout);
  }

  private typeQuestion() {
    const text = this.currentQuestion().text;
    this.displayedQuestion.set('');
    this.isTypingQuestion.set(true);
    this.clearTypeInterval();
    let i = 0;
    this.typeInterval = setInterval(() => {
      i++;
      this.displayedQuestion.set(text.slice(0, i));
      if (i >= text.length) {
        this.clearTypeInterval();
        this.isTypingQuestion.set(false);
      }
    }, 35);
  }

  private clearTypeInterval() {
    if (this.typeInterval) { clearInterval(this.typeInterval); this.typeInterval = null; }
  }

  private startTimer() {
    this.timerValue.set(TIMER_SECONDS);
    this.slowWarned = false;
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timerValue.update(v => {
        if (v <= 1) {
          clearInterval(this.timerInterval);
          this.registerAnswer(false);
          return 0;
        }
        // Aviso de lentitud cuando queda 30% del tiempo
        if (!this.slowWarned && v <= Math.floor(TIMER_SECONDS * 0.3)) {
          this.slowWarned = true;
          this.say(pick(COMMENTS['slow']));
        }
        return v - 1;
      });
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  registerAnswer(correct: boolean) {
    this.clearTimer();
    const qId = this.currentQuestion().id;
    this.results.update(r => [...r, { questionId: qId, correct }]);
    this.lastCorrect.set(correct);
    this.showResult.set(true);
    this.phase.set('reveal');

    // Elige comentario según situación
    this.pickComment(correct);

    setTimeout(() => {
      this.showResult.set(false);
      setTimeout(() => this.advance(), 300);
    }, 1800);
  }

  randomAnswer() {
    if (this.phase() !== 'question') return;
    this.registerAnswer(Math.random() < 0.5);
  }

  private pickComment(correct: boolean) {
    const q = this.currentQuestion();

    // Si la pregunta tiene explicación propia, úsala siempre — es más educativa
    if (correct && q.explanationCorrect) {
      this.say(q.explanationCorrect);
      return;
    }
    if (!correct && q.explanationWrong) {
      this.say(q.explanationWrong);
      return;
    }

    // Sin explicación específica: usa comentarios genéricos con lógica de racha
    const res = this.results();
    const total = res.length;

    if (this.currentIndex() >= this.totalQuestions - 2) {
      this.say(pick(COMMENTS['almost_done']));
      return;
    }
    if (correct && total >= 3 &&
        res[total-1].correct && res[total-2].correct && res[total-3]?.correct) {
      this.say(pick(COMMENTS['streak_correct']));
      return;
    }
    if (!correct && total >= 2 && !res[total-1].correct && !res[total-2]?.correct) {
      this.say(pick(COMMENTS['streak_wrong']));
      return;
    }
    this.say(pick(correct ? COMMENTS['correct'] : COMMENTS['wrong']));
  }

  private say(text: string) {
    this.comment.set(text);
    this.commentKey.update(k => k + 1);
    this.showComment.set(true);
    if (this.commentTimeout) clearTimeout(this.commentTimeout);
    this.commentTimeout = setTimeout(() => this.showComment.set(false), 10000);
  }

  private emitSpaceMode() {
    const idx = this.currentIndex();
    const total = this.totalQuestions;
    const lastTwo = idx >= total - 2;
    const pastHalf = idx >= Math.floor(total / 2);

    if (lastTwo)      this.spaceModeChange.emit('chaos');
    else if (pastHalf) this.spaceModeChange.emit('faster');
    else               this.spaceModeChange.emit('fast');
  }

  private advance() {
    if (this.isLastQuestion()) {
      this.phase.set('finished');
      const ratio = this.correctCount() / this.totalQuestions;
      if (ratio === 1)       this.say(pick(COMMENTS['finished_great']));
      else if (ratio >= 0.5) this.say(pick(COMMENTS['finished_good']));
      else                   this.say(pick(COMMENTS['finished_ok']));
      return;
    }
    this.currentIndex.update(i => i + 1);
    this.phase.set('question');
    this.lastCorrect.set(null);
    this.typeQuestion();
    this.startTimer();
    this.emitSpaceMode();
  }

  trackById(_: number, r: QuizResult) { return r.questionId; }
}
