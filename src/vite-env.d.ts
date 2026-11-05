/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL del backend (por ejemplo http://localhost:4000). Si no se define, la app usa el modo local.
  readonly VITE_API_URL?: string;
  // 'true' habilita el modo de demostracion local en un build de produccion sin VITE_API_URL.
  readonly VITE_ENABLE_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
