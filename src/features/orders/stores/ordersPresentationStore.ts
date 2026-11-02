import { ref } from 'vue'

export type OrdersResource = 'local' | 'remote'

export interface OrdersPresentationStore {
  readonly ordersResource: OrdersResource
  setOrdersResource(resource: OrdersResource): void
}

export const makeOrdersPresentationStore = (): OrdersPresentationStore => {
  const ordersResource = ref<OrdersResource>('local')

  return {
    // Getter keeps reads reactive: Vue tracks the ref when accessed in a
    // reactive scope (computed, watch, query key getter)
    get ordersResource() {
      return ordersResource.value
    },
    setOrdersResource: (resource) => {
      ordersResource.value = resource
    },
  }
}

let instance: OrdersPresentationStore | null = null

export const useOrdersPresentationStore = (): OrdersPresentationStore => {
  instance ??= makeOrdersPresentationStore()

  return instance
}
