// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module 'virtual:pwa-info' {
  import type { PwaInfo } from '@vite-pwa/sveltekit';
  export const pwaInfo: PwaInfo;
}

export {};
