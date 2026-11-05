// Cliente HTTP del backend. Si VITE_API_URL no esta definida, la app funciona en modo local (navegador).
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';
const TOKEN_KEY = 'edusudamericano_api_token';

export const isApiMode = API_URL.length > 0;

// El modo local (demostracion, sin contrasena) solo existe si se pide de forma explicita:
// en desarrollo, o en un build con VITE_ENABLE_DEMO=true. Un build de produccion sin VITE_API_URL
// no cae al modo local: muestra un error de configuracion.
export const isDemoMode = !isApiMode && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true');
export const configurationError: string | null = !isApiMode && !isDemoMode
  ? 'Falta VITE_API_URL: esta compilacion no tiene un servidor configurado y el modo de demostracion no esta habilitado (VITE_ENABLE_DEMO=true).'
  : null;

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

// El token se guarda por pestana (sessionStorage): al cerrar el navegador hay que iniciar sesion de nuevo.
export const tokenStore = {
  get: () => {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token: string) => {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch { /* sin almacenamiento disponible */ }
  },
  clear: () => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento disponible */ }
  },
};

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexion o que el backend este en ejecucion.', 0, 'NETWORK');
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    let code: string | undefined;
    try {
      const body = await response.json();
      message = Array.isArray(body.details) && body.details.length ? `${body.message}: ${body.details.join(', ')}` : body.message || message;
      code = body.code;
    } catch { /* respuesta sin JSON */ }
    if (response.status === 401 && path !== '/auth/login') {
      tokenStore.clear();
      onUnauthorized?.();
    }
    throw new ApiError(message, response.status, code);
  }
  return response;
};

export const api = {
  get: async <T>(path: string): Promise<T> => (await request(path)).json(),
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
    return response.status === 204 ? (undefined as T) : response.json();
  },
  patch: async <T>(path: string, body: unknown): Promise<T> =>
    (await request(path, { method: 'PATCH', body: JSON.stringify(body) })).json(),
  delete: async (path: string): Promise<void> => {
    await request(path, { method: 'DELETE' });
  },
  blob: async (path: string): Promise<Blob> => (await request(path)).blob(),
};

export const describeError = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrio un error inesperado';
