import { Injectable } from '@angular/core';

export interface GeminiVerdict {
  winner: 'left' | 'right';
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly apiKey = '';
  private readonly url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${this.apiKey}`;

  async evaluate(
    topicTitle: string,
    topicDescription: string,
    answerLeft: string,
    answerRight: string,
  ): Promise<GeminiVerdict> {
    const prompt = `Eres un evaluador de una actividad académica sobre gestión de mercados.

Caso: ${topicTitle}
${topicDescription}

Equipo Izquierdo respondió: "${answerLeft}"
Equipo Derecho respondió: "${answerRight}"

Evalúa cuál respuesta es más completa, estratégica y correcta desde el punto de vista del marketing y la gestión de mercados.
Responde ÚNICAMENTE con este JSON, sin texto adicional, sin markdown, sin bloques de código:
{"winner":"left o right","reason":"explicación breve en español de máximo 2 oraciones"}`;

    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text: string = data.candidates[0].content.parts[0].text.trim();

    // Gemini a veces envuelve en ```json ... ``` — lo limpiamos
    const clean = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    return JSON.parse(clean) as GeminiVerdict;
  }

  async testConnection(): Promise<string> {
    const prompt = 'Responde solo con: "Conexión exitosa con Gemini ✅"';
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  async listModels(): Promise<{ name: string; displayName: string; supportedMethods: string[] }[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return (data.models ?? []).map((m: any) => ({
      name: m.name,
      displayName: m.displayName ?? m.name,
      supportedMethods: m.supportedGenerationMethods ?? [],
    }));
  }
}
