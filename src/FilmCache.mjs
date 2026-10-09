// HBO cache ownership: a movie or an episode counts once, regardless of segment count.
export const LIBRARY_KEY = 'HBOAI.Library.v1';
export function filmIdentity(plan, manifestationId) {
  return plan?.editId ? `edit:${plan.editId}` : `manifest:${manifestationId}`;
}
export class FilmCache {
  constructor(store, limit = 20, onEvict = () => {}) { this.store = store; this.limit = limit; this.onEvict = onEvict; }
  read() {
    try { const value = JSON.parse(this.store.read(LIBRARY_KEY) || '{}'); return { version: 1, films: Array.isArray(value.films) ? value.films : [] }; }
    catch { return { version: 1, films: [] }; }
  }
  film(id) { return this.read().films.find(film => film.id === id); }
  native(id, key) { return this.film(id)?.native?.[key]?.body; }
  translation(id, key) { return this.film(id)?.translations?.[key]; }
  adoptIdentity(oldId, id) {
    if (oldId === id) return;
    const library = this.read(), old = library.films.find(film => film.id === oldId);
    if (!old) return;
    const target = library.films.find(film => film.id === id);
    if (!target) old.id = id;
    else {
      // Keep the earliest admission when metadata arrives after an initial fallback ID.
      const first = library.films.indexOf(old) < library.films.indexOf(target) ? old : target;
      first.id = id;first.addedAt = Math.min(old.addedAt, target.addedAt);
      first.native = { ...old.native, ...target.native };first.translations = { ...old.translations, ...target.translations };
      library.films = library.films.filter(film => film === first || (film !== old && film !== target));
    }
    this.store.write(JSON.stringify(library), LIBRARY_KEY);
  }
  put(id, kind, key, value) {
    // Merge a fresh snapshot so concurrently completed segments don't erase one another.
    const library = this.read();
    let film = library.films.find(film => film.id === id);
    if (!film) { film = { id, addedAt: Date.now(), native: {}, translations: {} }; library.films.push(film); }
    film[kind] ||= {};
    film[kind][key] = kind === 'native' ? { body: value } : value;
    // FIFO by first admission: reading or adding another segment never moves a film.
    const evicted = library.films.splice(0, Math.max(0, library.films.length - this.limit));
    const written = this.store.write(JSON.stringify(library), LIBRARY_KEY);
    if (written && evicted.length) this.onEvict(evicted.map(film => film.id));
    return { written: Boolean(written), films: library.films.length, segments: Object.keys(film.translations).length };
  }
}
