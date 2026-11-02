import type { ItemEntityId, OrderEntityId } from '../../repositories'

export interface OrderParams {
  orderId: OrderEntityId
}

/**
 * Presenter contract consumed by Order's template. Each property is a
 * behaviorless ViewModel value.
 */
export interface Presenter {
  hasOrder: boolean
  orderId: OrderEntityId
  userId: string
  itemIds: ItemEntityId[]
  summaryLabel: string
  isDeleteOrderButtonDisabled: boolean
}
