const LEGACY_PREFIX = "pasupatastra.";
const PREFIX = "pasupasastra.";

let migrated = false;

/** Moves localStorage entries saved under the former product name, once per page load. */
export function migrateLegacyStorage(): void {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  try {
    const store = window.localStorage;
    const legacy: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key?.startsWith(LEGACY_PREFIX)) legacy.push(key);
    }
    for (const key of legacy) {
      const value = store.getItem(key);
      const next = PREFIX + key.slice(LEGACY_PREFIX.length);
      if (value !== null && store.getItem(next) === null) {
        store.setItem(next, value);
      }
      store.removeItem(key);
    }
  } catch {
    /* storage unavailable: nothing to migrate */
  }
}
