<template>
  <div class="row column better-modhub">
    <div class="features-tabs features-tabs--mods">
      <div class="clearfix">
        <h3 class="nav-title">
          <a href="#" @click.stop.prevent>MODS++</a>
        </h3>
        <ul class="tabs">
          <li
            v-for="tab in dynamicTabs"
            :key="tab.value"
            class="tabs-title"
            :class="{ 'is-active': tab.value === activeTab }"
          >
            <a href="#" @click.stop.prevent="chooseSort(tab.value)">
              {{ tab.name }}
            </a>
          </li>
          <li
            v-show="!dynamicDisabled"
            class="tabs-title float-right reload-button"
          >
            <a href="#" @click.stop.prevent="fetchMods(true)">⟳</a>
          </li>
          <li class="tabs-title is-parent tabs-mods-category float-right">
            <a href="#" @click.stop.prevent><span>Categories</span></a>
            <AppCategories />
          </li>
        </ul>
      </div>
    </div>
    <AppModsList
      :sort-by="activeTab"
      :mods="mods"
      :fetching="fetching"
    ></AppModsList>
  </div>
</template>

<script setup>
import { computed, onMounted, shallowRef } from 'vue';
import AppCategories from './components/AppCategories.vue';
import { useParseCategory } from './composables/useParseCategory.js';
import { useStorage } from '@vueuse/core';
import AppModsList from './components/AppModsList.vue';

const disabledFilters = ['most', 'crossplay', 'latest'];

const filter = shallowRef(null);
const fetching = shallowRef(false);
const mods = shallowRef([]);
const searchParams = new URLSearchParams(window.location.search);
let activeTabParam = '';
if (searchParams.get('sort')) {
  activeTabParam = searchParams.get('sort');
} else {
  activeTabParam = 'default';
  changeSortQueryParam('default');
}
const activeTab = shallowRef(activeTabParam);

const dynamicDisabled = computed(
  () => !filter.value || disabledFilters.includes(filter.value),
);
const dynamicTabs = computed(() => {
  const defaultTab = {
    value: 'default',
    name: 'DEFAULT',
  };

  if (!dynamicDisabled.value) {
    return [
      defaultTab,
      {
        value: 'top',
        name: 'Top 🠗',
      },
      {
        value: 'alpha',
        name: 'A-Z 🠕',
      },
    ];
  }

  return [defaultTab];
});

onMounted(async () => {
  filter.value = searchParams.get('filter');
  await fetchMods();
});

function chooseSort(sortBy) {
  activeTab.value = sortBy;
  changeSortQueryParam(sortBy);
}

async function fetchMods(refetch = false) {
  if (!dynamicDisabled.value) {
    const storedData = useStorage(filter.value, [], undefined, {
      shallow: true,
    });
    if (!storedData.value?.length || refetch) {
      storedData.value = await fetchData();
    }
    mods.value = storedData.value;
  }
}

async function fetchData() {
  if (!dynamicDisabled.value) {
    // eslint-disable-next-line no-console
    console.log('fetching mods...');
    fetching.value = true;
    const data = await useParseCategory(window.location);
    fetching.value = false;
    return data;
  }
}

function changeSortQueryParam(sort) {
  const url = new URL(window.location);
  url.searchParams.set('sort', sort);
  history.replaceState({}, '', url);
}
</script>

<style>
.better-modhub .features-tabs .tabs {
  padding-right: 0;
}
.better-modhub .reload-button {
  text-align: center;
  min-width: 70px;
  padding: 0;
}
.features-tabs .tabs-title.reload-button:after {
  content: none;
}
</style>
