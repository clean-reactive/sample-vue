<script setup lang="ts">
import type { OrderParams } from './Order.types'
import { OrderItem } from '../OrderItem'
import { deleteOrderButtonTestId, orderTestId } from '../../testIds'
import { usePresenter } from './composables'

const props = defineProps<OrderParams>()

// presenter
const presenter = usePresenter(props)

// controller
const deleteOrderButtonClicked: () => void = () => {}
</script>

<template>
  <div v-if="presenter.hasOrder" class="card bg-base-200 shadow-md" :data-testid="orderTestId">
    <div class="card-body p-4 gap-3">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="text-xs text-base-content/40 uppercase tracking-widest">Order</div>
          <code class="text-sm font-semibold">{{ presenter.orderId }}</code>
          <div class="flex items-center gap-1 text-xs text-base-content/50">
            <span>User</span>
            <code>{{ presenter.userId }}</code>
          </div>
        </div>
        <button
          class="btn btn-sm btn-error btn-outline shrink-0"
          :data-testid="deleteOrderButtonTestId"
          :disabled="presenter.isDeleteOrderButtonDisabled"
          @click="deleteOrderButtonClicked"
        >
          Delete Order
        </button>
      </div>
      <details class="group">
        <summary
          class="cursor-pointer select-none text-xs text-base-content/50 uppercase tracking-wider w-fit"
        >
          {{ presenter.summaryLabel }}
        </summary>
        <div class="mt-2 flex flex-col gap-1">
          <OrderItem
            v-for="itemId in presenter.itemIds"
            :key="itemId"
            :order-id="presenter.orderId"
            :item-id="itemId"
          />
        </div>
      </details>
    </div>
  </div>
</template>
