// Extends Vitest's `expect` with the jest-dom matchers for every test file.
import "@testing-library/jest-dom/vitest";

// Node 22+ ships a `localStorage` global that only works behind a flag and
// shadows jsdom's; tests get a plain in-memory Storage instead.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

const storage = new MemoryStorage();
for (const target of [globalThis, typeof window === "undefined" ? null : window]) {
  if (target) Object.defineProperty(target, "localStorage", { value: storage, configurable: true });
}
