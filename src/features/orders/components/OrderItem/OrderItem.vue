<script setup lang="ts">
import type { OrderItemParams } from './OrderItem.types'
import { deleteItemButtonTestId, orderItemTestId } from '../../testIds'

defineProps<OrderItemParams>()

// presenter
const hasItem: boolean = true
const itemId: string = '1'
const productId: string = '17'
const quantity: number = 3
const isDeleteItemButtonDisabled: boolean = false

// controller
const deleteOrderItemButtonClicked: () => void = () => {}
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
