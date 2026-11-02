import { describe, beforeEach, vi, it, expect, assert } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from '../../repositories/ordersRepository/utils/testing'
import {
  makeOrderEntityId,
  useDeleteOrderItemMutation,
  useDeleteOrderMutation,
  type OrderEntity,
} from '../../repositories'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../utils/testing'
import { withSetup } from '../../utils/testing/withSetup'
import { useOrderByIdSelector } from './useOrderByIdSelector'
import { useOrdersSelector } from '../useOrdersSelector'

vi.mock('../../repositories/ordersRepository/OrdersService')

interface IntegrationTestContext {
  orderEntities: OrderEntity[]
  ordersServiceMock: MockedOrdersService
}

const unknownOrderEntityId = makeOrderEntityId('unknown')

const useSut = () => {
  const deleteOrder = useDeleteOrderMutation()
  const deleteOrderItem = useDeleteOrderItemMutation()
  const orders = useOrdersSelector()
  const firstOrderFromSelector = useOrderByIdSelector(
    () => orders.value.at(0)?.id ?? unknownOrderEntityId,
  )

  const deleteOrderButtonClicked = () => {
    const order = orders.value.at(0)
    assert(order)
    deleteOrder.mutate({ orderId: order.id })
  }

  const deleteItemButtonClicked = () => {
    const order = orders.value.at(0)
    const item = order?.itemEntities.at(0)
    assert(order && item)
    deleteOrderItem.mutate({ orderId: order.id, itemId: item.id })
  }

  return { orders, firstOrderFromSelector, deleteOrderButtonClicked, deleteItemButtonClicked }
}

describe(`${useOrderByIdSelector.name}: Delete Order and Item`, () => {
  const ordersServiceMock = makeOrdersServiceMock()

  beforeEach<IntegrationTestContext>((context) => {
    resetOrderEntitiesFactories()
    context.orderEntities = makeOrderEntities()
    context.ordersServiceMock = ordersServiceMock.mock
  })

  it<IntegrationTestContext>('deletes an order and then deletes an item from a remaining order', async (context) => {
    const initialOrders = context.orderEntities
    const [orderToDelete, remainingOrderWithItem] = initialOrders
    const itemToDelete = remainingOrderWithItem?.itemEntities.at(0)
    assert(orderToDelete && remainingOrderWithItem && itemToDelete)

    const ordersAfterOrderDeletion = initialOrders.slice(1)
    const updatedRemainingOrder = {
      ...remainingOrderWithItem,
      itemEntities: remainingOrderWithItem.itemEntities.slice(1),
    }
    const ordersAfterItemDeletion = [updatedRemainingOrder, ...ordersAfterOrderDeletion.slice(1)]

    context.ordersServiceMock.getOrders
      .mockResolvedValueOnce(initialOrders)
      .mockResolvedValueOnce(ordersAfterOrderDeletion)
      .mockResolvedValueOnce(ordersAfterItemDeletion)
    context.ordersServiceMock.deleteOrder.mockResolvedValue()
    context.ordersServiceMock.deleteItem.mockResolvedValue()

    const [sut] = withSetup(useSut)
    await flushPromises()

    expect(sut.orders.value).toEqual(initialOrders)
    expect(sut.firstOrderFromSelector.value?.id).toBe(orderToDelete.id)

    sut.deleteOrderButtonClicked()
    await flushPromises()

    expect(context.ordersServiceMock.deleteOrder).toHaveBeenCalledWith(orderToDelete.id)
    expect(sut.orders.value).toEqual(ordersAfterOrderDeletion)
    expect(sut.firstOrderFromSelector.value?.id).toBe(ordersAfterOrderDeletion.at(0)?.id)

    sut.deleteItemButtonClicked()
    await flushPromises()

    expect(context.ordersServiceMock.deleteItem).toHaveBeenCalledWith(
      remainingOrderWithItem.id,
      itemToDelete.id,
    )
    expect(sut.orders.value).toEqual(ordersAfterItemDeletion)
    expect(sut.firstOrderFromSelector.value?.id).toBe(ordersAfterItemDeletion.at(0)?.id)
  })
})
