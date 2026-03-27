// La API siempre corre en el mismo host que el frontend, puerto 3000
const BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
export const API_KEY = 'JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc';

// Mantenido por compatibilidad con los botones "Reintentar" de los componentes
export function resetApiUrl() {}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status} en ${path}: ${text}`);
  }
  return response;
}
