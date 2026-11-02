import type { OrderEntity } from '../../repositories'
import { itemEntityFactory } from './itemEntityFactory'
import { orderEntityFactory } from './orderEntityFactory'

export const makeOrderEntities = (ordersCount = 5, itemsCount = 7): OrderEntity[] => {
  const orders = orderEntityFactory.list({ count: ordersCount })
  const items = itemEntityFactory.list({ count: itemsCount })
  orders.forEach((order) => {
    order.itemEntities = items
  })

  return orders
}

export const resetOrderEntitiesFactories = () => {
  orderEntityFactory.resetCount()
  itemEntityFactory.resetCount()
}
