import { factoryT, fields } from 'factory-t'
import type {
  OrderEntity,
  OrderEntityId,
  ItemEntity,
  ItemEntityId,
} from '../../ordersRepository.types'
import { randomFrom1To100 } from '../../../../../../utils/testing'

export const itemEntityFactory = factoryT<ItemEntity>({
  id: (ctx) => `${ctx.index}` as ItemEntityId,
  productId: fields.sequence(
    randomFrom1To100.slice(randomFrom1To100.length / 2).map((v) => v.toString()),
  ),
  quantity: fields.sequence(randomFrom1To100),
})

export const orderEntityFactory = factoryT<OrderEntity>({
  id: (ctx) => `${ctx.index}` as OrderEntityId,
  userId: fields.sequence(randomFrom1To100.map((n) => n.toString())),
  itemEntities: [],
})

export const makeOrderEntitiesMock = (ordersCount = 5, itemsCount = 7): OrderEntity[] =>
  Array.from({ length: ordersCount }, () =>
    orderEntityFactory.item({
      itemEntities: itemEntityFactory.list({ count: itemsCount }),
    }),
  )
