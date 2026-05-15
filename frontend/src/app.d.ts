/// <reference types="@sveltejs/kit" />

declare namespace App {
  // interface Error {}
  // interface Locals {}
  // interface PageData {}
  // interface Platform {}
}

declare module '$env/static/public' {
  export const VITE_API_BASE_URL: string;
}