<script setup lang="ts">
import { totalItemQuantityTestId } from '../testIds'

// presenter
const uniqueUsersCount: number = 1
const ordersCount: number = 3
const itemLinesCount: number = 6
const totalItemsQuantity: number = 18
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
