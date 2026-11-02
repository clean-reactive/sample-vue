import type { OrdersResource } from '../../../stores'
import type { OrdersGateway } from '../ordersRepository.types'
import { makeInMemoryOrdersService } from './InMemoryOrdersService'

export const makeOrdersService = (resource: OrdersResource): OrdersGateway => {
  if (resource === 'local') {
    return makeInMemoryOrdersService()
  }
  throw new Error(`OrdersGateway for "${resource}" resource is not implemented`)
}
