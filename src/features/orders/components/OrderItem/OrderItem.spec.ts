import { Deferred } from '@esfx/async-deferred'
import { render, screen, waitFor } from '@testing-library/vue'
import { assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderItem } from '.'
import { makeOrdersServiceMock } from '../../repositories/ordersRepository/utils/testing'
import { makeComponentFixture } from '../../utils/testing/makeComponentFixture'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../../utils/testing'
import { orderItemTestId } from '../../testIds'

vi.mock('../../repositories/ordersRepository/OrdersService')

describe('OrderItem', () => {
  const gateway = makeOrdersServiceMock()

  beforeEach(() => {
    resetOrderEntitiesFactories()
  })

  it('presents the item and deletes it through the gateway', async () => {
    const [order] = makeOrderEntities(1, 2)
    const item = order?.itemEntities.at(0)
    assert(order && item)
    gateway.mock.getOrders.mockResolvedValue([order])
    gateway.mock.deleteItem.mockResolvedValue()
    const { global, user } = makeComponentFixture()

    render(OrderItem, { props: { orderId: order.id, itemId: item.id }, global })

    const button = await screen.findByRole('button', { name: 'Delete Item' })
    expect(screen.getByTestId(orderItemTestId)).toHaveTextContent(item.productId)
    expect(screen.getByTestId(orderItemTestId)).toHaveTextContent(String(item.quantity))
    await user.click(button)

    expect(gateway.mock.deleteItem).toHaveBeenCalledWith(order.id, item.id)
    expect(gateway.mock.deleteOrder).not.toHaveBeenCalled()
  })

  it('deletes the order when its last item is deleted', async () => {
    const [order] = makeOrderEntities(1, 1)
    const item = order?.itemEntities.at(0)
    assert(order && item)
    gateway.mock.getOrders.mockResolvedValue([order])
    gateway.mock.deleteOrder.mockResolvedValue()
    const { global, user } = makeComponentFixture()

    render(OrderItem, { props: { orderId: order.id, itemId: item.id }, global })
    await user.click(await screen.findByRole('button', { name: 'Delete Item' }))

    expect(gateway.mock.deleteOrder).toHaveBeenCalledWith(order.id)
    expect(gateway.mock.deleteItem).not.toHaveBeenCalled()
  })

  it('hides a pending deletion and restores the item after rejection', async () => {
    const [order] = makeOrderEntities(1, 2)
    const item = order?.itemEntities.at(0)
    assert(order && item)
    const deletion = new Deferred<void>()
    gateway.mock.getOrders.mockResolvedValue([order])
    gateway.mock.deleteItem.mockReturnValue(deletion.promise)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { global, user } = makeComponentFixture()

    render(OrderItem, { props: { orderId: order.id, itemId: item.id }, global })
    await user.click(await screen.findByRole('button', { name: 'Delete Item' }))
    await waitFor(() => expect(screen.queryByTestId(orderItemTestId)).not.toBeInTheDocument())

    deletion.reject(new Error('Deletion failed'))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete Item' })).toBeEnabled())
  })

  it('uses the current identity when component props change', async () => {
    const orders = makeOrderEntities(2, 2)
    const [first, second] = orders
    const firstItem = first?.itemEntities.at(0)
    const secondItem = second?.itemEntities.at(1)
    assert(first && second && firstItem && secondItem)
    gateway.mock.getOrders.mockResolvedValue(orders)
    gateway.mock.deleteItem.mockResolvedValue()
    const { global, user } = makeComponentFixture()

    const { rerender } = render(OrderItem, {
      props: { orderId: first.id, itemId: firstItem.id },
      global,
    })
    await screen.findByRole('button', { name: 'Delete Item' })

    await rerender({ orderId: second.id, itemId: secondItem.id })
    await user.click(screen.getByRole('button', { name: 'Delete Item' }))

    expect(gateway.mock.deleteItem).toHaveBeenCalledWith(second.id, secondItem.id)
  })
})
