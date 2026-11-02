import { describe, beforeEach, afterEach, vi, it, expect, assert } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { Deferred } from '@esfx/async-deferred'
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from '../../repositories/ordersRepository/utils/testing'
import { makeOrderEntityId, type OrderEntity, type OrderEntityId } from '../../repositories'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../utils/testing'
import { withSetup } from '../../utils/testing/withSetup'
import { useOrderByIdSelector } from './useOrderByIdSelector'

vi.mock('../../repositories/ordersRepository/OrdersService')

interface LocalTestContext {
  orderEntities: OrderEntity[]
  ordersServiceMock: MockedOrdersService
}

const setup = (orderId: OrderEntityId) => {
  const [order, wrapper] = withSetup(() => useOrderByIdSelector(orderId))
  return { order, wrapper }
}

describe(`${useOrderByIdSelector.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock()

  beforeEach<LocalTestContext>((context) => {
    resetOrderEntitiesFactories()
    context.orderEntities = makeOrderEntities(3)
    context.ordersServiceMock = ordersServiceMock.mock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it<LocalTestContext>('returns undefined when no orders are available', async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue([])

    const { order } = setup(makeOrderEntityId('9000'))
    await flushPromises()

    expect(order.value).toBeUndefined()
  })

  it<LocalTestContext>('returns the correct order when it exists', async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities)
    const targetOrder = context.orderEntities.at(1)
    assert(targetOrder)

    const { order } = setup(targetOrder.id)
    await flushPromises()

    expect(order.value).toEqual(targetOrder)
  })

  it<LocalTestContext>('returns undefined when the order with the given ID does not exist', async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities)

    const { order } = setup(makeOrderEntityId('non-existent-id'))
    await flushPromises()

    expect(order.value).toBeUndefined()
  })

  it<LocalTestContext>('returns undefined while orders are being loaded', async (context) => {
    const { promise } = new Deferred<OrderEntity[]>()
    context.ordersServiceMock.getOrders.mockReturnValue(promise)

    const { order } = setup(makeOrderEntityId('123'))
    await flushPromises()

    expect(order.value).toBeUndefined()
  })

  it<LocalTestContext>('returns the first order when searching for the first order ID', async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities)
    const firstOrder = context.orderEntities.at(0)
    assert(firstOrder)

    const { order } = setup(firstOrder.id)
    await flushPromises()

    expect(order.value).toEqual(firstOrder)
  })

  it<LocalTestContext>('returns the last order when searching for the last order ID', async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities)
    const lastOrder = context.orderEntities.at(-1)
    assert(lastOrder)

    const { order } = setup(lastOrder.id)
    await flushPromises()

    expect(order.value).toEqual(lastOrder)
  })
})
