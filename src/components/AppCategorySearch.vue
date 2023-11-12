<template>
  <div class="search-category">
    <a v-show="search" class="clear-icon" href="#" @click.stop.prevent="clear">
      ✖
    </a>
    <input
      v-model="search"
      type="text"
      name="searchMod"
      placeholder="Search in category"
      class="mod-search-input"
      :style="{ 'margin-left': search ? 0 : '32px' }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const debounceEmit = useDebounceFn((value) => {
  emit('update:modelValue', value);
  const encodedValue = encodeURIComponent(value);
  const url = new URL(window.location);
  if (encodedValue) {
    url.searchParams.set('search', encodedValue);
  } else {
    url.searchParams.delete('search');
  }
  history.replaceState({}, '', url);
}, 350);
const search = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    debounceEmit(value);
  },
});

function clear() {
  emit('update:modelValue', '');
}
</script>

<style>
.search-category {
  padding: 11px 10px 11px;
  display: flex;
  align-items: center;
}
.search-category a.clear-icon {
  width: 32px;
  padding: 5px 10px;
  color: unset;
}
.search-category a.clear-icon:hover {
  color: rgb(163, 201, 118);
}
.search-category .mod-search-input {
  background-position: 96%;
  background-origin: border-box;
}
</style>
