import { describe, it, expect, vi, beforeEach, assert } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from '../../repositories/ordersRepository/utils/testing'
import type { OrderEntity } from '../../repositories'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../utils/testing'
import { withSetup } from '../../utils/testing/withSetup'
import { useOrdersSelector } from '../useOrdersSelector'
import { useDeleteOrderUseCase } from './useDeleteOrderUseCase'

vi.mock('../../repositories/ordersRepository/OrdersService')

interface LocalTestContext {
  orders: OrderEntity[]
  ordersServiceMock: MockedOrdersService
}

describe(`${useDeleteOrderUseCase.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock()

  beforeEach<LocalTestContext>((context) => {
    resetOrderEntitiesFactories()
    context.orders = makeOrderEntities()
    context.ordersServiceMock = ordersServiceMock.mock
  })

  it<LocalTestContext>('deletes order by id', async (context) => {
    const orderToDelete = context.orders.at(2)
    assert(orderToDelete)
    const orders0 = [...context.orders]
    const orders1 = context.orders.filter((order) => order.id !== orderToDelete.id)

    context.ordersServiceMock.getOrders
      .mockResolvedValueOnce(orders0)
      .mockResolvedValueOnce(orders1)
    context.ordersServiceMock.deleteOrder.mockResolvedValueOnce()

    const [result] = withSetup(() => ({
      useCase: useDeleteOrderUseCase({ orderId: orderToDelete.id }),
      orders: useOrdersSelector(),
    }))

    await flushPromises()

    void result.useCase.execute()

    await flushPromises()

    expect(context.ordersServiceMock.deleteOrder).toHaveBeenCalledExactlyOnceWith(orderToDelete.id)
    expect(result.orders.value.map((order) => order.id)).toEqual(orders1.map((order) => order.id))
  })
})
