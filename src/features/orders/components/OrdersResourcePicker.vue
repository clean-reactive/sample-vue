<script setup lang="ts">
import { computed } from 'vue'
import { useOrdersPresentationStore } from '../stores'
import { isOrdersResource } from '../utils'

const store = useOrdersPresentationStore()

// presenter
const isLocalChecked = computed(() => store.ordersResource === 'local')
const isRemoteChecked = computed(() => store.ordersResource === 'remote')

// controller
const radioInputChanged = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (!isOrdersResource(value)) {
    return
  }
  store.setOrdersResource(value)
}
</script>

<template>
  <div class="join">
    <input
      class="join-item btn btn-sm"
      type="radio"
      name="orders-resource"
      aria-label="Local"
      value="local"
      :checked="isLocalChecked"
      @change="radioInputChanged"
    />
    <input
      class="join-item btn btn-sm"
      type="radio"
      name="orders-resource"
      aria-label="Remote"
      value="remote"
      :checked="isRemoteChecked"
      @change="radioInputChanged"
    />
  </div>
</template>
