<script setup lang="ts">
import { computed } from 'vue'
import { useIsMutating } from '@tanstack/vue-query'
import { ordersTestId } from '../testIds'
import { Order, OrdersResourcePicker, OrdersStatistics } from '../components'
import {
  deleteOrderItemMutationKey,
  deleteOrderMutationKey,
  useGetOrdersQuery,
} from '../repositories'

const { data: orders, isLoading, isFetching, isError } = useGetOrdersQuery()
const deleteOrderMutatingCount = useIsMutating({ mutationKey: deleteOrderMutationKey })
const deleteOrderItemMutatingCount = useIsMutating({ mutationKey: deleteOrderItemMutationKey })

// presenter
const isMutating = computed(
  () => deleteOrderMutatingCount.value + deleteOrderItemMutatingCount.value > 0,
)
const statusLabel = computed(() => {
  if (isLoading.value) {
    return 'loading'
  }
  if (isFetching.value) {
    return 'fetching'
  }
  if (isMutating.value) {
    return 'mutating'
  }
  if (isError.value) {
    return 'failed'
  }
  return 'idle'
})
const isProcessing = computed(() => isLoading.value || isFetching.value || isMutating.value)
const statusBadgeType = computed(() => {
  if (isProcessing.value) {
    return 'badge-warning'
  }
  if (isError.value) {
    return 'badge-error'
  }
  return 'badge-success'
})
const orderIds = computed(() => orders.value?.map((order) => order.id) ?? [])
</script>

<template>
  <div class="w-140 max-w-full text-left" :data-testid="ordersTestId">
    <h2 class="text-lg font-bold tracking-widest uppercase mb-5">Orders</h2>
    <div class="mb-5">
      <div class="text-xs text-base-content/40 uppercase tracking-widest mb-2">Resource</div>
      <div class="flex items-center justify-between">
        <OrdersResourcePicker />
        <div class="badge gap-1" :class="statusBadgeType">
          <span v-if="isProcessing" class="loading loading-spinner loading-xs" />
          {{ statusLabel }}
        </div>
      </div>
    </div>
    <div class="mb-5">
      <div class="text-xs text-base-content/40 uppercase tracking-widest mb-2">Statistics</div>
      <OrdersStatistics />
    </div>
    <div class="flex flex-col gap-3">
      <Order v-for="orderId in orderIds" :key="orderId" :order-id="orderId" />
    </div>
  </div>
</template>
