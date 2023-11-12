<template>
  <div class="pagination-wrap app-paginator">
    <div class="pagination-previous" :class="{ disabled: currentPage === 1 }">
      <a
        v-if="currentPage !== 1"
        href="#"
        aria-label="Previous page"
        @click.stop.prevent="previous"
      ></a>
    </div>
    <ul
      class="pagination text-center clearfix"
      role="navigation"
      aria-label="Pagination"
    >
      <li
        v-for="page in pages"
        :key="page.value"
        :class="{ current: page.isCurrent }"
      >
        <span v-if="page.isDot" class="dots">...</span>
        <span v-else-if="page.isCurrent">{{ page.value }}</span>
        <a
          v-else
          href="#"
          :aria-label="page.label"
          @click.prevent.stop="clickOnPage(page.value)"
        >
          {{ page.value }}
        </a>
      </li>
    </ul>
    <div
      class="pagination-next"
      :class="{ disabled: currentPage === pageCount }"
    >
      <a
        v-if="currentPage !== pageCount"
        href="#"
        aria-label="Next page"
        @click.stop.prevent="next"
      ></a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);
const maxPages = 7;

const currentPage = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const pages = computed(() => {
  const pgs = [];
  if (props.pageCount <= maxPages) {
    for (let i = 1; i <= props.pageCount; i++) {
      pgs.push({
        isCurrent: currentPage.value === i,
        value: i,
        label: `Page ${i}`,
        isDot: false,
      });
    }
  } else {
    if (currentPage.value < maxPages - 2) {
      for (let i = 1; i <= maxPages - 2; i++) {
        pgs.push({
          isCurrent: currentPage.value === i,
          value: i,
          label: `Page ${i}`,
          isDot: false,
        });
      }
      pgs.push({
        isCurrent: false,
        value: 0,
        label: '',
        isDot: true,
      });
      pgs.push({
        isCurrent: false,
        value: props.pageCount,
        label: `Page ${props.pageCount}`,
        isDot: false,
      });
    } else if (currentPage.value > props.pageCount - (maxPages - 3)) {
      pgs.push({
        isCurrent: false,
        value: 1,
        label: 'Page 1',
        isDot: false,
      });
      pgs.push({
        isCurrent: false,
        value: 0,
        label: '',
        isDot: true,
      });
      for (
        let i = props.pageCount - (maxPages - 3);
        i <= props.pageCount;
        i++
      ) {
        pgs.push({
          isCurrent: currentPage.value === i,
          value: i,
          label: `Page ${i}`,
          isDot: false,
        });
      }
    } else {
      pgs.push({
        isCurrent: false,
        value: 1,
        label: 'Page 1',
        isDot: false,
      });
      pgs.push({
        isCurrent: false,
        value: 0,
        label: '',
        isDot: true,
      });
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pgs.push({
          isCurrent: currentPage.value === i,
          value: i,
          label: `Page ${i}`,
          isDot: false,
        });
      }
      pgs.push({
        isCurrent: false,
        value: 0,
        label: '',
        isDot: true,
      });
      pgs.push({
        isCurrent: false,
        value: props.pageCount,
        label: `Page ${props.pageCount}`,
        isDot: false,
      });
    }
  }
  return pgs;
});

function clickOnPage(value) {
  currentPage.value = value;
  returnToTop();
  changePageQueryParam(value);
}

function next() {
  if (currentPage.value < props.pageCount) {
    currentPage.value++;
    returnToTop();
    changePageQueryParam(currentPage.value + 1);
  }
}

function previous() {
  if (currentPage.value > 1) {
    returnToTop();
    currentPage.value--;
    changePageQueryParam(currentPage.value - 1);
  }
}

function changePageQueryParam(value) {
  const url = new URL(window.location);
  url.searchParams.set('page', value - 1);
  history.replaceState(null, '', url);
}

function returnToTop() {
  window.scrollTo({
    top: 525,
    behavior: 'smooth',
  });
}
</script>

<style>
.app-paginator .pagination li {
  margin-right: 0;
}
</style>
