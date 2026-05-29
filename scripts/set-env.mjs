// scripts/set-env.mjs
// Lee el .env de la raíz y genera src/environments/environment.ts
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Leer .env
const envPath = resolve(root, '.env');
const envVars = {};
try {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    envVars[key.trim()] = rest.join('=').trim();
  }
} catch {
  console.warn('⚠️  No se encontró .env — usando valores vacíos');
}

const content = `// Este archivo es generado automáticamente por scripts/set-env.mjs
// No lo edites a mano — edita el .env en la raíz del proyecto
export const environment = {
  geminiApiKey: '${envVars['GEMINI_API_KEY'] ?? ''}',
};
`;

const outPath = resolve(root, 'src/environments/environment.ts');
writeFileSync(outPath, content, 'utf-8');
console.log('✅  environment.ts generado con la API key del .env');
