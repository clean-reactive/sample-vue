import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { OrdersResourcePicker, OrdersStatistics } from '.'
import { makeOrdersServiceMock } from '../repositories/ordersRepository/utils/testing'
import { makeOrdersService } from '../repositories/ordersRepository/OrdersService'
import type { OrdersGateway } from '../repositories/ordersRepository/ordersRepository.types'
import { makeComponentFixture } from '../utils/testing/makeComponentFixture'

vi.mock('../repositories/ordersRepository/OrdersService')

describe('OrdersResourcePicker', () => {
  const gateway = makeOrdersServiceMock()

  it('selects the resource and reloads its data through the gateway', async () => {
    const local = {
      ...gateway.mock,
      getOrders: vi.fn<OrdersGateway['getOrders']>().mockResolvedValue([]),
    }
    const remote = {
      ...gateway.mock,
      getOrders: vi.fn<OrdersGateway['getOrders']>().mockResolvedValue([]),
    }
    vi.mocked(makeOrdersService).mockImplementation((resource) =>
      resource === 'local' ? local : remote,
    )
    const { global, user } = makeComponentFixture()

    render(
      defineComponent(() => () => [h(OrdersResourcePicker), h(OrdersStatistics)]),
      { global },
    )

    expect(screen.getByRole('radio', { name: 'Local' })).toBeChecked()
    expect(local.getOrders).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('radio', { name: 'Remote' }))
    expect(screen.getByRole('radio', { name: 'Remote' })).toBeChecked()
    expect(remote.getOrders).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('radio', { name: 'Local' }))
    expect(screen.getByRole('radio', { name: 'Local' })).toBeChecked()
    expect(local.getOrders).toHaveBeenCalledTimes(2)
  })
})
