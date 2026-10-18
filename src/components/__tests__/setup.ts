import { expect } from "bun:test";
import { GlobalWindow } from "happy-dom";

// Setup happy-dom environment
const window = new GlobalWindow();
global.window = window as any;
global.document = window.document as any;
global.navigator = window.navigator as any;
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Also clear JSDOM environment if they overlap
if (typeof document === 'undefined') {
  console.log("Setting up document...");
}
