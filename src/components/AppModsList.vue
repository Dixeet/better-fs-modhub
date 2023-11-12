<template>
  <Teleport to="body > div > div.box-space">
    <div v-if="isVisible">
      <div v-show="!fetching">
        <div class="row column">
          <AppPaginator v-model="currentPage" :page-count="pageCount" />
        </div>
        <div class="row">
          <div
            v-for="(mod, index) in modsPaginated"
            :key="`mod-${index}`"
            class="medium-6 large-3 columns"
          >
            <div class="mod-item">
              <div class="mod-item__img">
                <a :href="mod.href">
                  <img :src="mod.img" />
                </a>
              </div>
              <div class="mod-item__content">
                <h4>{{ mod.name }}</h4>
                <p>
                  <span>{{ mod.author }}</span>
                </p>
                <div class="mods-rating clearfix">
                  <span
                    v-for="(star, startIndex) in mod.stars"
                    :key="`star-${startIndex}`"
                    :class="star"
                    class="icon-star"
                  ></span>
                </div>
                <div class="mod-item__rating-num">
                  {{ mod.rating }}&nbsp;({{ mod.downloads }})
                </div>
              </div>
              <a
                :href="mod.href"
                class="button button-buy button-middle button-no-margin expanded"
              >
                MORE INFO
              </a>
            </div>
          </div>
        </div>
        <div class="row column">
          <AppPaginator v-model="currentPage" :page-count="pageCount" />
        </div>
      </div>
      <div v-show="fetching">
        <div class="row column">Fetching...</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, shallowRef, watch, watchEffect } from 'vue';
import AppPaginator from './AppPaginator.vue';

const props = defineProps({
  mods: {
    type: Array,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  fetching: {
    type: Boolean,
    default: false,
  },
  search: {
    type: String,
    default: '',
  },
});

const modsPerPages = 24;

const searchParams = new URLSearchParams(window.location.search);
const currentPageParam =
  searchParams.get('page') === null
    ? 1
    : parseInt(searchParams.get('page')) + 1;
const currentPage = shallowRef(currentPageParam);

const isVisible = computed(() => {
  return props.sortBy !== 'default';
});
const modsSorted = computed(() => {
  let modsSorted = [...props.mods];
  if (props.search) {
    modsSorted = modsSorted.filter((mod) => {
      return props.search
        .split(' ')
        .every((s) => mod.name.toLowerCase().includes(s.toLowerCase()));
    });
  }
  if (props.sortBy === 'top') {
    modsSorted.sort((a, b) => b.downloads - a.downloads);
  } else if (props.sortBy === 'alpha') {
    modsSorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return modsSorted.map((mod) => {
    const semiRoundedStar = Math.round(mod.rating * 2) / 2;
    const floorStar = Math.floor(semiRoundedStar);
    const stars = [];
    for (let i = 1; i < 6; i++) {
      const classes = [];
      if (i > floorStar) {
        if (i - semiRoundedStar < 1 && semiRoundedStar % floorStar) {
          classes.push('half');
        } else {
          classes.push('grey');
        }
      }
      stars.push(classes);
    }
    return {
      ...mod,
      stars,
    };
  });
});
const pageCount = computed(() => {
  return Math.ceil(modsSorted.value.length / modsPerPages);
});
const modsPaginated = computed(() => {
  return modsSorted.value.slice(
    (currentPage.value - 1) * 24,
    currentPage.value * 24,
  );
});

watchEffect(() => {
  const defaultElements = document.querySelectorAll(
    'body > div > div.box-space > div.row',
  );
  if (isVisible.value) {
    defaultElements.forEach((el, index) => {
      if (index > 0) {
        el.style.display = 'none';
      }
    });
  } else {
    defaultElements.forEach((el, index) => {
      if (index > 0) {
        el.style.display = 'block';
      }
    });
  }
});

watch(
  () => props.sortBy,
  () => {
    currentPage.value = 1;
    const url = new URL(window.location);
    url.searchParams.set('page', 0);
    history.replaceState(null, '', url);
  },
);
</script>

<style></style>
