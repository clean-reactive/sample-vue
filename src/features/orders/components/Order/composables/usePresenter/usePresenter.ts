import { computed, type ComputedRef } from 'vue'
import type { OrderParams, Presenter } from '../../Order.types'
import { makeOrderEntityId } from '../../../../repositories'
import { useIsDeleteOrderMutatingSelector, useOrderByIdSelector } from '../../../../composables'

/**
 * Converts selector results into stable, template-ready values. The presenter
 * performs no mutations and returns safe defaults while the order is unavailable.
 */
export const usePresenter = (params: OrderParams): ComputedRef<Presenter> => {
  const order = useOrderByIdSelector(() => params.orderId)
  const isDeleteOrderInProgress = useIsDeleteOrderMutatingSelector(() => params.orderId)

  return computed(() => {
    if (!order.value) {
      return {
        hasOrder: false,
        orderId: makeOrderEntityId(''),
        userId: '',
        itemIds: [],
        summaryLabel: '',
        isDeleteOrderButtonDisabled: false,
      }
    }

    const itemIds = order.value.itemEntities.map((itemEntity) => itemEntity.id)

    return {
      hasOrder: true,
      orderId: order.value.id,
      userId: order.value.userId,
      itemIds,
      summaryLabel: `${itemIds.length} item${itemIds.length !== 1 ? 's' : ''}`,
      isDeleteOrderButtonDisabled: isDeleteOrderInProgress.value,
    }
  })
}
