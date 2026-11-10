import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repository } from './repository'
import type { LearnerState } from './types'

const KEY = ['learner'] as const

export function useLearner() {
  return useQuery({ queryKey: KEY, queryFn: () => repository.load() })
}

export function useUpdateLearner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mutate: (draft: LearnerState) => void) => repository.update(mutate),
    onSuccess: (state) => qc.setQueryData(KEY, state),
  })
}

export function useResetLearner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => repository.reset(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
