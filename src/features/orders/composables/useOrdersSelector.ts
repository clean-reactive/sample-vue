import { computed, type ComputedRef } from 'vue'
import { useGetOrdersQuery, type OrderEntity } from '../repositories'

const DEFAULT_ORDERS: OrderEntity[] = []

/** Normalizes repository query state into the shared Order entity collection. */
export const useOrdersSelector = (): ComputedRef<OrderEntity[]> => {
  const { data } = useGetOrdersQuery()
  return computed(() => data.value ?? DEFAULT_ORDERS)
}
