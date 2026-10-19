<script setup lang="ts">
// presenter
const isLocalChecked: boolean = true
const isRemoteChecked: boolean = false

// controller
const radioInputChanged: (event: Event) => void = () => {}
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
