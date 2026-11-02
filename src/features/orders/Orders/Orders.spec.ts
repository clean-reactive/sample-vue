import { Deferred } from '@esfx/async-deferred'
import { render, screen } from '@testing-library/vue'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { Orders } from '.'
import { ordersTestId } from '../testIds'
import type { OrderEntity, OrderEntityId } from '../repositories'
import { makeOrdersServiceMock } from '../repositories/ordersRepository/utils/testing'
import { makeComponentFixture } from '../utils/testing/makeComponentFixture'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../utils/testing'

vi.mock('../repositories/ordersRepository/OrdersService')

const stubs = {
  Order: defineComponent({
    props: { orderId: { type: String, required: true } },
    setup: (props) => () =>
      h(
        'div',
        { 'data-testid': `order-${props.orderId as OrderEntityId}` },
        `Order ${props.orderId}`,
      ),
  }),
  OrdersResourcePicker: defineComponent(
    () => () => h('div', { 'data-testid': 'orders-resource-picker' }),
  ),
  OrdersStatistics: defineComponent(() => () => h('div', { 'data-testid': 'orders-statistics' })),
}

describe('Orders', () => {
  const gateway = makeOrdersServiceMock()

  beforeEach(() => {
    resetOrderEntitiesFactories()
  })

  it('shows loading without orders while the request is pending', async () => {
    const request = new Deferred<OrderEntity[]>()
    gateway.mock.getOrders.mockReturnValue(request.promise)
    const { global } = makeComponentFixture()

    render(Orders, { global: { ...global, stubs } })

    expect(screen.getByTestId(ordersTestId)).toBeInTheDocument()
    expect(await screen.findByText('loading')).toBeInTheDocument()
    expect(screen.queryByTestId(/^order-/)).not.toBeInTheDocument()

    request.resolve([])
    expect(await screen.findByText('idle')).toBeInTheDocument()
  })

  it('renders the IDs from the loaded orders', async () => {
    const orders = makeOrderEntities(3)
    gateway.mock.getOrders.mockResolvedValue(orders)
    const { global } = makeComponentFixture()

    render(Orders, { global: { ...global, stubs } })

    expect(await screen.findByText('idle')).toBeInTheDocument()
    orders.forEach((order) => {
      expect(screen.getByTestId(`order-${order.id}`)).toBeInTheDocument()
    })
  })

  it('renders an empty result', async () => {
    gateway.mock.getOrders.mockResolvedValue([])
    const { global } = makeComponentFixture()

    render(Orders, { global: { ...global, stubs } })

    expect(await screen.findByText('idle')).toBeInTheDocument()
    expect(screen.queryByTestId(/^order-/)).not.toBeInTheDocument()
  })

  it('shows a failed error badge when loading orders fails', async () => {
    gateway.mock.getOrders.mockRejectedValue(new Error('Orders are unavailable'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { global } = makeComponentFixture()

    render(Orders, { global: { ...global, stubs } })

    const failedBadge = await screen.findByText('failed')
    expect(failedBadge).toHaveClass('badge-error')
    expect(failedBadge.querySelector('.loading-spinner')).not.toBeInTheDocument()

    consoleError.mockRestore()
  })
})
