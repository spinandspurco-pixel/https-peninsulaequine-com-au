/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;
declare const __BUILD_COMMIT__: string;


declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.json" {
  const value: any;
  export default value;
}

