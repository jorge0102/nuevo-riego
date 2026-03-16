// Configuración central de la API
// Prueba primero la red local (más rápido), luego Tailscale (fuera de casa)
// Si ninguna está disponible, lanza 'OFFLINE' y los servicios usan mocks
const LOCAL_URL = 'http://192.168.1.103:3000/api';
const TAILSCALE_URL = 'http://100.125.188.123:3000/api';
export const API_KEY = 'JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc';

// 'OFFLINE' = detectado sin conexión; undefined = no detectado aún; string = URL activa
let cachedBaseUrl: string | undefined = undefined;
let offlineRetryAt = 0;
const OFFLINE_RETRY_MS = 15_000; // reintentar detección cada 15s en modo offline

async function resolveBaseUrl(): Promise<string | null> {
  // URL activa cacheada
  if (cachedBaseUrl && cachedBaseUrl !== 'OFFLINE') return cachedBaseUrl;
  // Modo offline: esperar antes de reintentar
  if (cachedBaseUrl === 'OFFLINE' && Date.now() < offlineRetryAt) return null;

  // Intenta red local (1.5 s)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 1500);
    await fetch(LOCAL_URL + '/sectors', { signal: ctrl.signal, headers: { 'X-API-Key': API_KEY } });
    clearTimeout(tid);
    cachedBaseUrl = LOCAL_URL;
    return cachedBaseUrl;
  } catch { /* no disponible */ }

  // Intenta Tailscale (3 s)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    await fetch(TAILSCALE_URL + '/sectors', { signal: ctrl.signal, headers: { 'X-API-Key': API_KEY } });
    clearTimeout(tid);
    cachedBaseUrl = TAILSCALE_URL;
    return cachedBaseUrl;
  } catch { /* no disponible */ }

  // Sin conexión: cachear estado offline con TTL
  cachedBaseUrl = 'OFFLINE';
  offlineRetryAt = Date.now() + OFFLINE_RETRY_MS;
  return null;
}

// Permite forzar re-detección (p.ej. al pulsar Reintentar)
export function resetApiUrl() {
  cachedBaseUrl = undefined;
  offlineRetryAt = 0;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) throw new Error('OFFLINE');

  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(options.headers || {}),
    },
  }).catch((err) => {
    // Error de red en llamada real → forzar re-detección la próxima vez
    cachedBaseUrl = undefined;
    throw err;
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error('Error ' + response.status + ' en ' + path + ': ' + text);
  }
  return response;
}
