import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrdersStatistics } from '.'
import { makeOrdersServiceMock } from '../repositories/ordersRepository/utils/testing'
import { makeComponentFixture } from '../utils/testing/makeComponentFixture'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../utils/testing'
import { totalItemQuantityTestId } from '../testIds'

vi.mock('../repositories/ordersRepository/OrdersService')

describe('OrdersStatistics', () => {
  const gateway = makeOrdersServiceMock()

  beforeEach(() => {
    resetOrderEntitiesFactories()
  })

  it('shows zero counts for an empty result', async () => {
    gateway.mock.getOrders.mockResolvedValue([])
    const { global } = makeComponentFixture()

    render(OrdersStatistics, { global })

    await waitFor(() => expect(gateway.mock.getOrders).toHaveBeenCalled())
    for (const label of ['users', 'orders', 'items', 'qty']) {
      expect(screen.getByText(label).parentElement).toHaveTextContent(`0${label}`)
    }
  })

  it('shows zero quantity when loading fails', async () => {
    gateway.mock.getOrders.mockRejectedValue(new Error('Unavailable'))
    const { global } = makeComponentFixture()

    render(OrdersStatistics, { global })

    await waitFor(() => expect(gateway.mock.getOrders).toHaveBeenCalled())
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(/^0$/)
  })

  it('projects distinct users, order and item counts, and total quantity', async () => {
    const orders = makeOrderEntities()
    orders.forEach((order) => {
      order.userId = 'same-user'
    })
    gateway.mock.getOrders.mockResolvedValue(orders)
    const { global } = makeComponentFixture()

    render(OrdersStatistics, { global })

    await waitFor(() =>
      expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(/^1825$/),
    )
    expect(screen.getByText('users').parentElement).toHaveTextContent('1users')
    expect(screen.getByText('orders').parentElement).toHaveTextContent('5orders')
    expect(screen.getByText('items').parentElement).toHaveTextContent('35items')
  })
})
