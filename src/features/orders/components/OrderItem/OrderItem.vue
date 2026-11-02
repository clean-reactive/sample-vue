<script setup lang="ts">
import { computed } from 'vue'
import { useMutationState } from '@tanstack/vue-query'
import type { OrderItemParams } from './OrderItem.types'
import { deleteItemButtonTestId, orderItemTestId } from '../../testIds'
import {
  deleteOrderItemMutationKey,
  useDeleteOrderItemMutation,
  useDeleteOrderMutation,
  type ItemEntityId,
  type OrderEntityId,
} from '../../repositories'
import { useIsDeleteOrderMutatingSelector, useOrderByIdSelector } from '../../composables'

const props = defineProps<OrderItemParams>()

const order = useOrderByIdSelector(() => props.orderId)
const isDeleteOrderInProgress = useIsDeleteOrderMutatingSelector(() => props.orderId)
const { mutateAsync: deleteOrder } = useDeleteOrderMutation()
const { mutateAsync: deleteItem } = useDeleteOrderItemMutation()
const pendingDeleteItems = useMutationState({
  filters: { mutationKey: deleteOrderItemMutationKey, status: 'pending' },
  select: (mutation) =>
    mutation.state.variables as { orderId: OrderEntityId; itemId: ItemEntityId },
})

// presenter
const item = computed(() =>
  order.value?.itemEntities.find((itemEntity) => itemEntity.id === props.itemId),
)
const hasItem = computed(() => item.value !== undefined)
const itemId = computed(() => item.value?.id ?? '')
const productId = computed(() => item.value?.productId ?? '')
const quantity = computed(() => item.value?.quantity ?? 0)
const isDeleteItemButtonDisabled = computed(
  () =>
    isDeleteOrderInProgress.value ||
    pendingDeleteItems.value.some(
      (variables) => variables.orderId === props.orderId && variables.itemId === props.itemId,
    ),
)

// controller with an inline use case; decisions read entities, not display values
const deleteOrderItemButtonClicked = async () => {
  try {
    if (order.value?.itemEntities.length === 1) {
      await deleteOrder({ orderId: props.orderId })
    } else {
      await deleteItem({ orderId: props.orderId, itemId: props.itemId })
    }
  } catch (error: unknown) {
    console.error(error)
  }
}
</script>

<template>
  <div
    v-if="hasItem"
    class="flex items-center gap-3 px-4 py-2 rounded-lg bg-base-300"
    :data-testid="orderItemTestId"
  >
    <div class="flex flex-1 gap-6 flex-wrap">
      <div>
        <div class="text-xs text-base-content/40 uppercase tracking-wider">id</div>
        <code class="text-sm">{{ itemId }}</code>
      </div>
      <div>
        <div class="text-xs text-base-content/40 uppercase tracking-wider">product id</div>
        <code class="text-sm">{{ productId }}</code>
      </div>
      <div>
        <div class="text-xs text-base-content/40 uppercase tracking-wider">quantity</div>
        <div class="badge badge-neutral badge-sm mt-1">{{ quantity }}</div>
      </div>
    </div>
    <button
      class="btn btn-xs btn-error btn-outline"
      :data-testid="deleteItemButtonTestId"
      :disabled="isDeleteItemButtonDisabled"
      @click="deleteOrderItemButtonClicked"
    >
      Delete Item
    </button>
  </div>
</template>
