<template>
  <ul class="tabs-mods-category-list">
    <li v-for="(category, index) in categories" :key="`cat-${index}`">
      <a :href="category.href">{{ category.name }}</a>
    </li>
  </ul>
</template>

<script setup>
import { onMounted, shallowRef } from 'vue';

const categories = shallowRef([]);

onMounted(() => {
  const categoriesElements = document.querySelectorAll(
    'body > div > div.box-space > div:nth-child(1) > div.features-tabs.features-tabs--mods > div > ul > li.tabs-mods-category > ul > li > a',
  );
  const cats = [];
  categoriesElements.forEach((el) => {
    cats.push({
      href: el.href,
      name: el.textContent,
    });
  });
  categories.value = cats.sort((a, b) => a.name.localeCompare(b.name));
});
</script>

<style></style>
