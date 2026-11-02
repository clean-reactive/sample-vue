import { assert, beforeEach, describe, expect, it } from 'vitest'
import {
  deleteItem,
  deleteOrder,
  getOrders,
  makeInMemoryOrdersService,
  makeService,
  setOrders,
  type OrdersMap,
} from './InMemoryOrdersService'
import type { OrderEntity } from '../../ordersRepository.types'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../../../utils/testing'
import { mockSleep } from '../../../../../../utils/testing/mockSleep'
import { makeOrderEntityId } from '../../ordersRepository.utils'

interface LocalTestContext {
  orders: OrderEntity[]
  ordersMap: OrdersMap
}

describe('InMemoryOrdersService', () => {
  beforeEach<LocalTestContext>((context) => {
    mockSleep()
    resetOrderEntitiesFactories()
    context.orders = makeOrderEntities()
    context.ordersMap = new Map()
    setOrders(context.ordersMap, context.orders)
  })

  describe(`${getOrders.name}`, () => {
    it<LocalTestContext>('returns the list of orders', async (context) => {
      const result = await getOrders(context.ordersMap)

      expect(result).toEqual(context.orders)
    })

    it('returns an empty array if no orders are available', async () => {
      const result = await getOrders(new Map())

      expect(result).toEqual([])
    })
  })

  describe(`${deleteOrder.name}`, () => {
    it<LocalTestContext>('deletes the order', async (context) => {
      const order = context.orders.at(3)
      assert(order)

      await deleteOrder(context.ordersMap, order.id)

      const result = await getOrders(context.ordersMap)

      expect(result).not.toContainEqual(order)
    })

    it<LocalTestContext>('throws an error if the order does not exist', async (context) => {
      const result = deleteOrder(context.ordersMap, makeOrderEntityId('9999'))

      await expect(result).rejects.toThrowError('Order with id 9999 not found')
    })
  })

  describe(`${deleteItem.name}`, () => {
    it<LocalTestContext>('deletes the item', async (context) => {
      const order = context.orders.at(1)
      const item = order?.itemEntities.at(1)
      assert(order && item)

      await deleteItem(context.ordersMap, order.id, item.id)

      const result = await getOrders(context.ordersMap)

      expect(result).toContainEqual({
        ...order,
        itemEntities: order.itemEntities.filter((itemEntity) => itemEntity.id !== item.id),
      })
    })

    it<LocalTestContext>('throws an error if the order does not exist', async (context) => {
      const item = context.orders.at(1)?.itemEntities.at(0)
      assert(item)

      const result = deleteItem(context.ordersMap, makeOrderEntityId('9999'), item.id)

      await expect(result).rejects.toThrowError('Order with id 9999 not found')
    })
  })

  describe(`${setOrders.name}`, () => {
    it<LocalTestContext>('adds new orders to the existing ones', async (context) => {
      const ordersMap: OrdersMap = new Map()

      setOrders(ordersMap, context.orders)

      const result = await getOrders(ordersMap)

      expect(result).toEqual(context.orders)
    })
  })

  describe(`${makeService.name}`, () => {
    it<LocalTestContext>('gives every instance its own orders', async (context) => {
      const serviceA = makeService(context.orders)
      const serviceB = makeService([])

      expect(await serviceA.getOrders()).toEqual(context.orders)
      expect(await serviceB.getOrders()).toEqual([])
    })
  })

  describe(`${makeInMemoryOrdersService.name}`, () => {
    it('returns the same instance on every call', () => {
      expect(makeInMemoryOrdersService()).toBe(makeInMemoryOrdersService())
    })
  })
})
