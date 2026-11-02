import userEvent from '@testing-library/user-event'
import type { GlobalMountOptions } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { useOrdersPresentationStore } from '../../stores'

export const makeComponentFixture = (): {
  user: ReturnType<typeof userEvent.setup>
  global: GlobalMountOptions
} => {
  // Infinite gcTime keeps TanStack from rescheduling garbage collection of a
  // pending mutation, which never lets vi.runAllTimersAsync settle
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { gcTime: Infinity } },
  })
  useOrdersPresentationStore().setOrdersResource('local')

  return {
    user: userEvent.setup(),
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  }
}
