/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL del backend (por ejemplo http://localhost:4000). Si no se define, la app usa el modo local.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
