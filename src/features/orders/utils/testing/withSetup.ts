import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

/** Runs a composable inside a component setup with a fresh QueryClient. */
export function withSetup<T>(composable: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let result!: T
  const wrapper = mount(
    defineComponent({
      setup() {
        result = composable()
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
  )
  return [result, wrapper] as const
}
