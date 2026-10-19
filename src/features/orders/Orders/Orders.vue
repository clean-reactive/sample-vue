<script setup lang="ts">
import { ordersTestId } from '../testIds'
import { Order, OrdersResourcePicker, OrdersStatistics } from '../components'

// presenter
const statusLabel: string = 'idle'
const statusBadgeType: string = 'badge-success'
const isProcessing: boolean = false
const orderIds: string[] = ['1', '2', '3']
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
