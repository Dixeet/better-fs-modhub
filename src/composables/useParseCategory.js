import { useQueue } from './useQueue.js';

export async function useParseCategory(link) {
  return new Promise((resolve) => {
    const baseURL = new URL(link);
    baseURL.searchParams.set('page', '0');
    getDocument(baseURL.href).then((doc) => {
      const nbPages = findNumberOfPages(doc);
      let mods = findPageMods(doc);
      const callbacks = [];
      for (let i = 1; i < nbPages; i++) {
        callbacks.push(async () => {
          const pageURL = new URL(link);
          pageURL.searchParams.set('page', i);
          const pageDoc = await getDocument(pageURL.href);
          mods = [...mods, ...findPageMods(pageDoc)];
        });
      }
      useQueue(callbacks, 200).then(() => {
        resolve(mods);
      });
    });
  });
}

async function getDocument(url) {
  const res = await fetch(url);
  const html = await res.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

function findNumberOfPages(doc) {
  let nbPages = 0;
  const pagesEl = doc.querySelector(
    'body > div > div.box-space > div > div.pagination-wrap > ul ',
  );
  if (pagesEl) {
    nbPages = parseInt(pagesEl.lastElementChild.textContent.trim());
  }
  return nbPages;
}

function findPageMods(doc) {
  const mods = [];
  const modsEl = doc.querySelectorAll(
    'body > div > div.box-space > div > div > div.mod-item',
  );
  if (modsEl.length) {
    modsEl.forEach((el) => {
      const img = el.querySelector('img').src;
      const href = el.querySelector('div.mod-item__img > a').href;
      const name = el.querySelector('h4').textContent;
      const author = el.querySelector('p > span').textContent;
      const ratingAndDlEl = el.querySelector('div.mod-item__rating-num');
      const ratingAndDl = ratingAndDlEl ? ratingAndDlEl.textContent : '0 (0)';
      let [rating, downloads] = ratingAndDl.split('(');
      rating = parseFloat(rating);
      downloads = parseInt(downloads.replace(/[()\n]/, ''));
      mods.push({
        img,
        href,
        name,
        author,
        rating,
        downloads,
      });
    });
  }
  return mods;
}
