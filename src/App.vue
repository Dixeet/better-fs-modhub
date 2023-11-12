<template>
  <div class="row column better-modhub">
    <div class="features-tabs features-tabs--mods">
      <div class="clearfix">
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
          <AppCategories />
          <li
            v-show="!dynamicDisabled && activeTab !== 'default'"
            class="tabs-title float-right"
          >
            <AppCategorySearch v-model="search" />
          </li>
        </ul>
      </div>
    </div>
    <AppModsList
      :sort-by="activeTab"
      :mods="mods"
      :fetching="fetching"
      :search="search"
    ></AppModsList>
  </div>
</template>

<script setup>
import { computed, onMounted, shallowRef } from 'vue';
import AppCategories from './components/AppCategories.vue';
import { useParseCategory } from './composables/useParseCategory.js';
import { useStorage } from '@vueuse/core';
import AppModsList from './components/AppModsList.vue';
import AppCategorySearch from './components/AppCategorySearch.vue';

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
const searchQueryParam = searchParams.get('search')
  ? decodeURIComponent(searchParams.get('search'))
  : '';
const search = shallowRef(searchQueryParam);

const dynamicDisabled = computed(
  () => !filter.value || disabledFilters.includes(filter.value),
);
const dynamicTabs = computed(() => {
  const defaultTab = {
    value: 'default',
    name: 'ModHub',
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

.features-tabs .tabs-title > span {
  font-size: 17px;
  color: #9e9e9e;
  text-transform: uppercase;
  font-family: 'RobotoCondensed';
  font-weight: 300;
  padding: 20px 0 17px;
  border-bottom: 3px solid transparent;
  display: block;
  line-height: 1;
}
</style>
