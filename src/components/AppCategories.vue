<template>
  <li
    class="tabs-title is-parent tabs-mods-category float-right"
    :class="{ 'is-active': isActive }"
  >
    <a href="#" @click.stop.prevent>
      <span>{{ currentCategoryName }}</span>
    </a>
    <ul class="tabs-mods-category-list">
      <li
        v-for="(category, index) in categories"
        :key="`cat-${index}`"
        class="is-active"
      >
        <a class="active" :href="category.href">{{ category.name }}</a>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { computed, onMounted, shallowRef } from 'vue';

const searchParams = new URLSearchParams(window.location.search);

const categories = shallowRef([]);
const filter = shallowRef(null);
const currentCategoryName = computed(() => {
  if (!filter.value) {
    return 'Categories';
  }
  const findCategory = categories.value.find(
    (category) => category.value === filter.value,
  );
  if (findCategory) {
    return findCategory.name;
  }
  return 'Categories';
});
const isActive = computed(() => currentCategoryName.value !== 'Categories');

onMounted(() => {
  const categoriesElements = document.querySelectorAll(
    'body > div > div.box-space > div:nth-child(1) > div.features-tabs.features-tabs--mods > div > ul > li.tabs-mods-category > ul > li > a',
  );
  const cats = [];
  categoriesElements.forEach((el) => {
    const elSearchParams = new URLSearchParams(el.href);
    const value = elSearchParams.get('filter');
    cats.push({
      href: el.href,
      name: el.textContent,
      value,
    });
  });
  categories.value = cats.sort((a, b) => a.name.localeCompare(b.name));
  filter.value = searchParams.get('filter');
});
</script>

<style></style>
