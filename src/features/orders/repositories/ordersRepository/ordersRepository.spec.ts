import { describe, it, beforeEach, afterEach, expect, vi, assert } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { Deferred } from '@esfx/async-deferred'
import {
  useDeleteOrderItemMutation,
  useDeleteOrderMutation,
  useGetOrdersQuery,
} from './ordersRepository'
import { makeOrdersService } from './OrdersService'
import { makeOrdersServiceMock, type MockedOrdersService } from './utils/testing'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../utils/testing'
import { withSetup } from '../../utils/testing/withSetup'
import type { OrderEntity } from './ordersRepository.types'
import { useOrdersPresentationStore } from '../../stores'

vi.mock('./OrdersService')

const useRepository = () => ({
  getOrders: useGetOrdersQuery(),
  deleteOrder: useDeleteOrderMutation(),
  deleteOrderItem: useDeleteOrderItemMutation(),
})

interface LocalTestContext {
  gatewayMock: MockedOrdersService
  orderEntities: OrderEntity[]
  repository: ReturnType<typeof useRepository>
  wrapper: VueWrapper
}

describe('ordersRepository', () => {
  const ordersServiceMock = makeOrdersServiceMock()

  beforeEach<LocalTestContext>(async (context) => {
    resetOrderEntitiesFactories()
    context.gatewayMock = ordersServiceMock.mock
    context.orderEntities = makeOrderEntities(3, 2)
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities)
    ;[context.repository, context.wrapper] = withSetup(useRepository)
    await flushPromises()
  })

  afterEach<LocalTestContext>((context) => {
    context.wrapper.unmount()
    useOrdersPresentationStore().setOrdersResource('local')
    vi.clearAllMocks()
  })

  describe(`${useGetOrdersQuery.name}`, () => {
    it<LocalTestContext>('loads orders from the gateway of the current resource', (context) => {
      expect(makeOrdersService).toHaveBeenCalledWith('local')
      expect(context.repository.getOrders.data.value).toEqual(context.orderEntities)
    })

    it<LocalTestContext>('refetches orders when the resource changes', async (context) => {
      const remoteOrders = makeOrderEntities(1)
      context.gatewayMock.getOrders.mockResolvedValue(remoteOrders)

      useOrdersPresentationStore().setOrdersResource('remote')
      await flushPromises()

      expect(makeOrdersService).toHaveBeenLastCalledWith('remote')
      expect(context.repository.getOrders.data.value).toEqual(remoteOrders)
    })
  })

  describe(`${useDeleteOrderMutation.name}`, () => {
    it<LocalTestContext>('removes the order optimistically and refetches once settled', async (context) => {
      const deferred = new Deferred<void>()
      context.gatewayMock.deleteOrder.mockReturnValue(deferred.promise)
      const [first, ...rest] = context.orderEntities
      assert(first)

      context.repository.deleteOrder.mutate({ orderId: first.id })
      await flushPromises()

      expect(context.repository.getOrders.data.value).toEqual(rest)
      expect(context.gatewayMock.getOrders).toHaveBeenCalledTimes(1)

      deferred.resolve()
      await flushPromises()

      expect(context.gatewayMock.deleteOrder).toHaveBeenCalledExactlyOnceWith(first.id)
      expect(context.gatewayMock.getOrders).toHaveBeenCalledTimes(2)
    })

    it<LocalTestContext>('restores the orders when the gateway fails', async (context) => {
      const deferred = new Deferred<void>()
      context.gatewayMock.deleteOrder.mockReturnValue(deferred.promise)
      const first = context.orderEntities.at(0)
      assert(first)

      context.repository.deleteOrder.mutate({ orderId: first.id })
      await flushPromises()
      deferred.reject(new Error('delete failed'))
      await flushPromises()

      expect(context.repository.getOrders.data.value).toEqual(context.orderEntities)
    })

    it<LocalTestContext>('refetches only after the last concurrent mutation settles', async (context) => {
      const firstDeferred = new Deferred<void>()
      const secondDeferred = new Deferred<void>()
      context.gatewayMock.deleteOrder
        .mockReturnValueOnce(firstDeferred.promise)
        .mockReturnValueOnce(secondDeferred.promise)
      const [first, second, ...rest] = context.orderEntities
      assert(first && second)

      context.repository.deleteOrder.mutate({ orderId: first.id })
      context.repository.deleteOrder.mutate({ orderId: second.id })
      await flushPromises()
      firstDeferred.resolve()
      await flushPromises()

      expect(context.repository.getOrders.data.value).toEqual(rest)
      expect(context.gatewayMock.getOrders).toHaveBeenCalledTimes(1)

      secondDeferred.resolve()
      await flushPromises()

      expect(context.gatewayMock.getOrders).toHaveBeenCalledTimes(2)
    })
  })

  describe(`${useDeleteOrderItemMutation.name}`, () => {
    it<LocalTestContext>('removes the item optimistically', async (context) => {
      const deferred = new Deferred<void>()
      context.gatewayMock.deleteItem.mockReturnValue(deferred.promise)
      const order = context.orderEntities.at(0)
      const [item, ...restItems] = order?.itemEntities ?? []
      assert(order && item)

      context.repository.deleteOrderItem.mutate({ orderId: order.id, itemId: item.id })
      await flushPromises()

      expect(context.repository.getOrders.data.value?.at(0)?.itemEntities).toEqual(restItems)

      deferred.resolve()
      await flushPromises()

      expect(context.gatewayMock.deleteItem).toHaveBeenCalledExactlyOnceWith(order.id, item.id)
    })

    it<LocalTestContext>('restores the item when the gateway fails', async (context) => {
      context.gatewayMock.deleteItem.mockRejectedValue(new Error('delete failed'))
      const order = context.orderEntities.at(0)
      const item = order?.itemEntities.at(0)
      assert(order && item)

      context.repository.deleteOrderItem.mutate({ orderId: order.id, itemId: item.id })
      await flushPromises()

      expect(context.repository.getOrders.data.value).toEqual(context.orderEntities)
    })
  })
})
