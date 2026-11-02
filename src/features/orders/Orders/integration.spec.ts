import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from '../repositories/ordersRepository/utils/testing'
import { Deferred } from '@esfx/async-deferred'
import { describe, beforeEach, vi, afterEach, it, expect, assert } from 'vitest'
import { render, screen } from '@testing-library/vue'
import type { UserEvent } from '@testing-library/user-event'
import type { OrderEntity } from '../repositories'
import { makeOrderEntities, resetOrderEntitiesFactories } from '../utils/testing'
import { makeComponentFixture } from '../utils/testing/makeComponentFixture'
import {
  deleteItemButtonTestId,
  totalItemQuantityTestId,
  deleteOrderButtonTestId,
} from '../testIds'
import { Orders } from '.'

vi.mock('../repositories/ordersRepository/OrdersService')

describe('Orders Integration Test', () => {
  const ordersServiceMock = makeOrdersServiceMock()

  interface IntegrationTestContext {
    renderSut: () => void
    user: UserEvent
    orderEntities: OrderEntity[]
    ordersServiceMock: MockedOrdersService
  }

  beforeEach<IntegrationTestContext>((context) => {
    vi.useFakeTimers()
    resetOrderEntitiesFactories()

    const { global, user } = makeComponentFixture()

    context.orderEntities = makeOrderEntities()
    context.ordersServiceMock = ordersServiceMock.mock

    let currentOrders = context.orderEntities

    context.ordersServiceMock.getOrders.mockImplementation(() =>
      Promise.resolve([...currentOrders]),
    )
    context.ordersServiceMock.deleteOrder.mockImplementation(async (orderId) => {
      currentOrders = currentOrders.filter((o) => o.id !== orderId)
    })
    context.ordersServiceMock.deleteItem.mockImplementation(async (orderId, itemId) => {
      currentOrders = currentOrders.map((o) =>
        o.id === orderId
          ? { ...o, itemEntities: o.itemEntities.filter((i) => i.id !== itemId) }
          : o,
      )
    })

    context.renderSut = () => {
      render(Orders, { global })
    }
    context.user = user
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it<IntegrationTestContext>('displays orders', async (context) => {
    context.renderSut()
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1825')
  })

  it<IntegrationTestContext>('handles order deletion', async (context) => {
    context.renderSut()
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1825')

    const [deleteButton] = screen.getAllByTestId(deleteOrderButtonTestId)
    assert(deleteButton)
    void context.user.click(deleteButton)
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1460')
  })

  it<IntegrationTestContext>('shows mutation status until an optimistic deletion finishes', async (context) => {
    const deletion = new Deferred<void>()
    context.ordersServiceMock.deleteOrder.mockReturnValue(deletion.promise)
    context.renderSut()
    await vi.runAllTimersAsync()

    const [deleteButton] = screen.getAllByTestId(deleteOrderButtonTestId)
    assert(deleteButton)
    const click = context.user.click(deleteButton)
    await vi.runAllTimersAsync()
    await click

    expect(screen.getByText('mutating')).toBeInTheDocument()
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1460')

    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities.slice(1))
    deletion.resolve()
    await vi.runAllTimersAsync()

    expect(screen.getByText('idle')).toBeInTheDocument()
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1460')
  })

  it<IntegrationTestContext>('handles order deletion followed by item deletion', async (context) => {
    context.renderSut()
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1825')

    const [deleteOrderButton] = screen.getAllByTestId(deleteOrderButtonTestId)
    assert(deleteOrderButton)
    void context.user.click(deleteOrderButton)
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1460')

    const [deleteItemButton] = screen.getAllByTestId(deleteItemButtonTestId)
    assert(deleteItemButton)
    void context.user.click(deleteItemButton)
    await vi.runAllTimersAsync()

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent('1385')
  })
})
