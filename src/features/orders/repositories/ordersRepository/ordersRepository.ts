import { useMutation, useQuery, type QueryClient } from '@tanstack/vue-query'
import type { ItemEntityId, OrderEntity, OrderEntityId } from './ordersRepository.types'
import {
  deleteOrderItemMutationKey,
  deleteOrderMutationKey,
  ordersQueryKey,
} from './ordersRepository.utils'
import { makeOrdersService } from './OrdersService'
import { useOrdersPresentationStore } from '../../stores'

type OrdersSnapshot = { previousOrders: [readonly unknown[], OrderEntity[] | undefined][] }

const takeOrdersSnapshot = async (client: QueryClient): Promise<OrdersSnapshot> => {
  await client.cancelQueries({ queryKey: ordersQueryKey })
  return { previousOrders: client.getQueriesData<OrderEntity[]>({ queryKey: ordersQueryKey }) }
}

const restoreOrdersSnapshot = (client: QueryClient, snapshot: OrdersSnapshot | undefined) => {
  snapshot?.previousOrders.forEach(([queryKey, data]) => {
    client.setQueryData(queryKey, data)
  })
}

// Invalidates only when the settling mutation is the last pending one, so an
// in-flight refetch does not overwrite optimistic updates of other mutations
const invalidateOrdersWhenIdle = (client: QueryClient) => {
  const pendingCount =
    client.isMutating({ mutationKey: deleteOrderMutationKey }) +
    client.isMutating({ mutationKey: deleteOrderItemMutationKey })
  if (pendingCount > 1) {
    return
  }
  void client.invalidateQueries({ queryKey: ordersQueryKey })
}

export const useGetOrdersQuery = () => {
  const store = useOrdersPresentationStore()

  return useQuery({
    queryKey: [...ordersQueryKey, () => store.ordersResource],
    queryFn: (): Promise<OrderEntity[]> => makeOrdersService(store.ordersResource).getOrders(),
  })
}

export const useDeleteOrderMutation = () => {
  const store = useOrdersPresentationStore()

  return useMutation({
    mutationKey: deleteOrderMutationKey,
    mutationFn: ({ orderId }: { orderId: OrderEntityId }) =>
      makeOrdersService(store.ordersResource).deleteOrder(orderId),
    onMutate: async ({ orderId }, context) => {
      const snapshot = await takeOrdersSnapshot(context.client)
      context.client.setQueriesData<OrderEntity[]>(
        { queryKey: ordersQueryKey },
        (orders) => orders?.filter((order) => order.id !== orderId) ?? [],
      )
      return snapshot
    },
    onError: (_error, _variables, snapshot, context) => {
      restoreOrdersSnapshot(context.client, snapshot)
    },
    onSettled: (_data, _error, _variables, _snapshot, context) => {
      invalidateOrdersWhenIdle(context.client)
    },
  })
}

export const useDeleteOrderItemMutation = () => {
  const store = useOrdersPresentationStore()

  return useMutation({
    mutationKey: deleteOrderItemMutationKey,
    mutationFn: ({ orderId, itemId }: { orderId: OrderEntityId; itemId: ItemEntityId }) =>
      makeOrdersService(store.ordersResource).deleteItem(orderId, itemId),
    onMutate: async ({ orderId, itemId }, context) => {
      const snapshot = await takeOrdersSnapshot(context.client)
      context.client.setQueriesData<OrderEntity[]>({ queryKey: ordersQueryKey }, (orders) =>
        (orders ?? []).map((order) =>
          order.id !== orderId
            ? order
            : {
                ...order,
                itemEntities: order.itemEntities.filter((item) => item.id !== itemId),
              },
        ),
      )
      return snapshot
    },
    onError: (_error, _variables, snapshot, context) => {
      restoreOrdersSnapshot(context.client, snapshot)
    },
    onSettled: (_data, _error, _variables, _snapshot, context) => {
      invalidateOrdersWhenIdle(context.client)
    },
  })
}
