<script setup lang="ts">
import type { OrderParams } from './Order.types'
import { OrderItem } from '../OrderItem'
import { deleteOrderButtonTestId, orderTestId } from '../../testIds'

defineProps<OrderParams>()

// presenter
const hasOrder: boolean = true
const orderId: string = '1'
const userId: string = '42'
const itemIds: string[] = ['1', '2']
const summaryLabel: string = '2 items'
const isDeleteOrderButtonDisabled: boolean = false

// controller
const deleteOrderButtonClicked: () => void = () => {}
</script>

<template>
  <div v-if="hasOrder" class="card bg-base-200 shadow-md" :data-testid="orderTestId">
    <div class="card-body p-4 gap-3">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="text-xs text-base-content/40 uppercase tracking-widest">Order</div>
          <code class="text-sm font-semibold">{{ orderId }}</code>
          <div class="flex items-center gap-1 text-xs text-base-content/50">
            <span>User</span>
            <code>{{ userId }}</code>
          </div>
        </div>
        <button
          class="btn btn-sm btn-error btn-outline shrink-0"
          :data-testid="deleteOrderButtonTestId"
          :disabled="isDeleteOrderButtonDisabled"
          @click="deleteOrderButtonClicked"
        >
          Delete Order
        </button>
      </div>
      <details class="group">
        <summary
          class="cursor-pointer select-none text-xs text-base-content/50 uppercase tracking-wider w-fit"
        >
          {{ summaryLabel }}
        </summary>
        <div class="mt-2 flex flex-col gap-1">
          <OrderItem
            v-for="itemId in itemIds"
            :key="itemId"
            :order-id="orderId"
            :item-id="itemId"
          />
        </div>
      </details>
    </div>
  </div>
</template>
