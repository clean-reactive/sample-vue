import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { OrderEntity, OrderEntityId } from '../../repositories'
import { useOrdersSelector } from '../useOrdersSelector'

/** Derives one Order entity from the shared orders collection. */
export const useOrderByIdSelector = (
  orderId: MaybeRefOrGetter<OrderEntityId>,
): ComputedRef<OrderEntity | undefined> => {
  const orders = useOrdersSelector()

  return computed(() => orders.value.find((orderEntity) => orderEntity.id === toValue(orderId)))
}
