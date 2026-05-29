import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, GeminiVerdict } from '../../gemini.service';

type TestState = 'idle' | 'loading' | 'ok' | 'error';

@Component({
  selector: 'app-debug-ia',
  imports: [CommonModule, FormsModule],
  templateUrl: './debug-ia.html',
  styleUrl: './debug-ia.scss',
})
export class DebugIa implements OnInit, OnDestroy {
  constructor(private gemini: GeminiService) {}

  ngOnInit()    { document.body.style.overflow = 'auto'; }
  ngOnDestroy() { document.body.style.overflow = ''; }

  // ── Test de conexión simple ──
  connState  = signal<TestState>('idle');
  connResult = signal('');

  async testConnection() {
    this.connState.set('loading');
    this.connResult.set('');
    try {
      const msg = await this.gemini.testConnection();
      this.connResult.set(msg);
      this.connState.set('ok');
    } catch (e: any) {
      this.connResult.set(e.message);
      this.connState.set('error');
    }
  }

  // ── List Models ──
  modelsState  = signal<TestState>('idle');
  modelsResult = signal<{ name: string; displayName: string; supportedMethods: string[] }[]>([]);
  modelsError  = signal('');
  modelsFilter = signal('generateContent');

  async listModels() {
    this.modelsState.set('loading');
    this.modelsResult.set([]);
    this.modelsError.set('');
    try {
      const models = await this.gemini.listModels();
      this.modelsResult.set(models);
      this.modelsState.set('ok');
    } catch (e: any) {
      this.modelsError.set(e.message);
      this.modelsState.set('error');
    }
  }

  filteredModels() {
    const f = this.modelsFilter().toLowerCase().trim();
    const all = this.modelsResult();
    if (!f) return all;
    return all.filter(m => m.supportedMethods.some(s => s.toLowerCase().includes(f)));
  }

  // ── Test de evaluación ──
  topicTitle       = 'Precio demasiado alto';
  topicDescription = 'Una marca de cuadernos ecológicos logró llamar la atención por su diseño, calidad y materiales reciclados. Aun así, muchos clientes consideran que su precio es demasiado alto frente a otras opciones más económicas del mercado.';
  answerLeft  = '';
  answerRight = '';

  evalState   = signal<TestState>('idle');
  evalResult  = signal<GeminiVerdict | null>(null);
  evalError   = signal('');

  async testEvaluate() {
    if (!this.answerLeft.trim() || !this.answerRight.trim()) return;
    this.evalState.set('loading');
    this.evalResult.set(null);
    this.evalError.set('');
    try {
      const verdict = await this.gemini.evaluate(
        this.topicTitle,
        this.topicDescription,
        this.answerLeft,
        this.answerRight,
      );
      this.evalResult.set(verdict);
      this.evalState.set('ok');
    } catch (e: any) {
      this.evalError.set(e.message);
      this.evalState.set('error');
    }
  }
}
