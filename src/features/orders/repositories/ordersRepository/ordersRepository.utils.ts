import type { OrderEntityId, ItemEntityId } from './ordersRepository.types'

export const ordersQueryKey = ['orders'] as const
export const deleteOrderMutationKey = ['deleteOrder'] as const
export const deleteOrderItemMutationKey = ['deleteOrderItem'] as const

export const makeOrderEntityId = (id: string): OrderEntityId => id as OrderEntityId
export const makeItemEntityId = (id: string): ItemEntityId => id as ItemEntityId
