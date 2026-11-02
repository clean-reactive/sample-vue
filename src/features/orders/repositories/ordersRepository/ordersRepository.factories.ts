import { factoryT, fields } from 'factory-t'
import type { ItemEntity, ItemEntityId, OrderEntity, OrderEntityId } from './ordersRepository.types'

export const itemEntityFactory = factoryT<ItemEntity>({
  id: (ctx) => `${ctx.index}` as ItemEntityId,
  productId: (ctx) => `${ctx.index}`,
  quantity: fields.index(),
})

export const orderEntityFactory = factoryT<OrderEntity>({
  id: (ctx) => `${ctx.index}` as OrderEntityId,
  userId: (ctx) => `${ctx.index}`,
  itemEntities: () => itemEntityFactory.list({ count: 2 }),
})
