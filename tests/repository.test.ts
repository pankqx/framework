import { describe, expect, it } from 'vitest'
import { createLocalRepository, type KeyValueStore } from '@/modules/learner/repository'

const fakeStore = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) }
}

describe('local learner repository', () => {
  it('starts empty, persists updates and resets', async () => {
    const store = fakeStore()
    const repo = createLocalRepository(store)
    expect((await repo.load()).profile).toBeNull()
    await repo.update((s) => void (s.profile = { displayName: 'Aki', currentLevel: 'n5', levelSource: 'placement', createdAt: new Date().toISOString() }))
    expect((await createLocalRepository(store).load()).profile?.displayName).toBe('Aki')
    await repo.reset()
    expect((await repo.load()).profile).toBeNull()
  })
  it('rejects invalid writes without saving them', async () => {
    const repo = createLocalRepository(fakeStore())
    await expect(repo.update((s) => void ((s.profile as unknown) = { displayName: '' }))).rejects.toThrow()
    expect((await repo.load()).profile).toBeNull()
  })
  it('sets corrupt data aside instead of crashing', async () => {
    const store = fakeStore()
    store.setItem('kotoba:learner:v1', '{not json')
    expect((await createLocalRepository(store).load()).attempts).toEqual([])
    expect(store.data.get('kotoba:learner:v1:corrupt')).toBe('{not json')
  })
})
