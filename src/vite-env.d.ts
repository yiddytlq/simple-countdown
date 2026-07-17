/// <reference types="vite/client" />

// Globals injected at runtime by public/variables.js (via variables.sh env substitution).
declare interface Window {
  background: string;
  target: Date;
  title: string;
}
