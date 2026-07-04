/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;
declare const __BUILD_COMMIT__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}


declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.json" {
  const value: any;
  export default value;
}

