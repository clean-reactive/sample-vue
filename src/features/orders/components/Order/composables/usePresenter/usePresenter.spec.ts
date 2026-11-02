import { describe, beforeEach, vi, it, expect, assert } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { Deferred } from '@esfx/async-deferred'
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from '../../../../repositories/ordersRepository/utils/testing'
import { useDeleteOrderMutation, type OrderEntity } from '../../../../repositories'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../../../utils/testing'
import { withSetup } from '../../../../utils/testing/withSetup'
import { usePresenter } from './usePresenter'

vi.mock('../../../../repositories/ordersRepository/OrdersService')

interface LocalTestContext {
  orders: OrderEntity[]
  ordersServiceMock: MockedOrdersService
}

describe(`${usePresenter.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock()

  beforeEach<LocalTestContext>((context) => {
    resetOrderEntitiesFactories()
    context.orders = makeOrderEntities()
    context.ordersServiceMock = ordersServiceMock.mock
  })

  it<LocalTestContext>('optimistically removes order once deletion is triggered', async (context) => {
    const order0 = context.orders.at(1)
    assert(order0)
    const { promise } = new Deferred<void>()
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orders)
    context.ordersServiceMock.deleteOrder.mockReturnValue(promise)

    const [result] = withSetup(() => ({
      presenter: usePresenter({ orderId: order0.id }),
      deleteOrder: useDeleteOrderMutation(),
    }))

    await flushPromises()

    const result0 = result.presenter.value.hasOrder

    result.deleteOrder.mutate({ orderId: order0.id })

    await flushPromises()

    const result1 = result.presenter.value.hasOrder

    expect(result0).toBe(true)
    expect(result1).toBe(false)
  })
})
