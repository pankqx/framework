import { emptyLearnerState, learnerStateSchema, type LearnerState } from './types'

/**
 * The only door between the UI and learner data. The app talks to this
 * interface; today it is backed by localStorage, and a Supabase adapter
 * (tables in supabase/migrations) can replace it without touching screens.
 */
export interface LearnerRepository {
  readonly mode: 'local' | 'supabase'
  load(): Promise<LearnerState>
  update(mutate: (draft: LearnerState) => void): Promise<LearnerState>
  reset(): Promise<void>
}

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const KEY = 'kotoba:learner:v1'

export function createLocalRepository(store: KeyValueStore): LearnerRepository {
  const read = (): LearnerState => {
    const raw = store.getItem(KEY)
    if (!raw) return emptyLearnerState()
    try {
      const parsed = learnerStateSchema.safeParse(JSON.parse(raw))
      if (parsed.success) return parsed.data
    } catch {
      /* fall through */
    }
    // Unreadable data is kept aside rather than silently destroyed.
    store.setItem(`${KEY}:corrupt`, raw)
    return emptyLearnerState()
  }
  return {
    mode: 'local',
    async load() {
      return read()
    },
    async update(mutate) {
      const next = structuredClone(read())
      mutate(next)
      const valid = learnerStateSchema.parse(next)
      store.setItem(KEY, JSON.stringify(valid))
      return valid
    },
    async reset() {
      store.removeItem(KEY)
    },
  }
}

export const supabaseConfigured = Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)

const memory = new Map<string, string>()
const memoryStore: KeyValueStore = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
}

function browserStore(): { store: KeyValueStore; persistent: boolean } {
  try {
    localStorage.setItem('kotoba:probe', '1')
    localStorage.removeItem('kotoba:probe')
    return { store: localStorage, persistent: true }
  } catch {
    return { store: memoryStore, persistent: false }
  }
}

const picked = browserStore()
/** False when the browser blocks storage: progress then lasts only until the tab closes, and the UI says so. */
export const storagePersistent = picked.persistent
export const repository: LearnerRepository = createLocalRepository(picked.store)
