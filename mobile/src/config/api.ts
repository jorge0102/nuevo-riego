// Configuración central de la API
// Prueba primero la red local (más rápido), luego IP pública (fuera de casa)
const LOCAL_URL   = 'http://192.168.1.104:3000/api';
const REMOTE_URL  = 'http://2.139.178.59:3000/api';
export const API_KEY = 'JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc';

let cachedBaseUrl: string | null = null;

async function resolveBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;

  // Intenta local con timeout corto (1.5 s)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    await fetch(LOCAL_URL + '/sectors', {
      signal: controller.signal,
      headers: { 'X-API-Key': API_KEY },
    });
    clearTimeout(timeout);
    cachedBaseUrl = LOCAL_URL;
    return cachedBaseUrl;
  } catch {
    // No alcanzable: usa Tailscale
  }

  cachedBaseUrl = REMOTE_URL;
  return cachedBaseUrl;
}

// Permite forzar re-detección (p.ej. al pulsar Reintentar)
export function resetApiUrl() {
  cachedBaseUrl = null;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = await resolveBaseUrl();
  const url = baseUrl + path;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error('Error ' + response.status + ' en ' + path + ': ' + text);
  }
  return response;
}
