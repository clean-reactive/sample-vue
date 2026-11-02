<script setup lang="ts">
import { computed } from 'vue'
import { totalItemQuantityTestId } from '../testIds'
import { useOrdersSelector } from '../composables'

const orders = useOrdersSelector()

// presenter
const uniqueUsersCount = computed(() => new Set(orders.value.map((order) => order.userId)).size)
const ordersCount = computed(() => orders.value.length)
const itemLinesCount = computed(() =>
  orders.value.reduce((count, order) => count + order.itemEntities.length, 0),
)
const totalItemsQuantity = computed(() =>
  orders.value.reduce(
    (total, order) =>
      total + order.itemEntities.reduce((subtotal, item) => subtotal + item.quantity, 0),
    0,
  ),
)
</script>

<template>
  <div class="flex gap-2">
    <div class="badge badge-ghost gap-1">
      <span>{{ uniqueUsersCount }}</span>
      <span>users</span>
    </div>
    <div class="badge badge-ghost gap-1">
      <span>{{ ordersCount }}</span>
      <span>orders</span>
    </div>
    <div class="badge badge-ghost gap-1">
      <span>{{ itemLinesCount }}</span>
      <span>items</span>
    </div>
    <div class="badge badge-ghost gap-1">
      <span :data-testid="totalItemQuantityTestId">{{ totalItemsQuantity }}</span>
      <span>qty</span>
    </div>
  </div>
</template>
