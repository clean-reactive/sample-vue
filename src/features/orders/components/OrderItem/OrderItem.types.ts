import type { ItemEntityId, OrderEntityId } from '../../repositories'

export interface OrderItemParams {
  orderId: OrderEntityId
  itemId: ItemEntityId
}
