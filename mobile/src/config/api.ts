// Configuración central de la API
// Si la IP del Pi cambia, solo hay que cambiarla aquí
export const API_BASE_URL = 'http://192.168.0.19:3000/api';
export const API_KEY = 'JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = API_BASE_URL + path;
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
