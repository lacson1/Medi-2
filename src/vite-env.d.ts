/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASE44_SERVER_URL: string
    readonly VITE_BASE44_APP_ID: string
    readonly VITE_USE_MOCK_DATA: string
    readonly VITE_ENABLE_DEBUG_MODE: string
    readonly VITE_SENTRY_DSN: string
    readonly VITE_APP_VERSION: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
