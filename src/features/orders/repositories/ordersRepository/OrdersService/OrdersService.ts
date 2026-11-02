import type { OrdersResource } from '../../../stores'
import type { OrdersGateway } from '../ordersRepository.types'

export const makeOrdersService = (resource: OrdersResource): OrdersGateway => {
  throw new Error(`OrdersGateway for "${resource}" resource is not implemented`)
}
