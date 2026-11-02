import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useMutationState } from '@tanstack/vue-query'
import { deleteOrderMutationKey, type OrderEntityId } from '../repositories'

/** Reports whether the current order has a pending delete mutation in TanStack Query. */
export const useIsDeleteOrderMutatingSelector = (
  orderId: MaybeRefOrGetter<OrderEntityId>,
): ComputedRef<boolean> => {
  const pendingOrderIds = useMutationState({
    filters: { mutationKey: deleteOrderMutationKey, status: 'pending' },
    select: (mutation) => (mutation.state.variables as { orderId: OrderEntityId }).orderId,
  })

  return computed(() => pendingOrderIds.value.includes(toValue(orderId)))
}
