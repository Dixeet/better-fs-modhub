// ==UserScript==
// @name       better-fs-modhub
// @namespace  npm/vite-plugin-monkey
// @version    0.0.0
// @author     monkey
// @icon       https://vitejs.dev/logo.svg
// @match      https://www.farming-simulator.com/mods.php*
// @require    https://cdn.jsdelivr.net/npm/vue@3.3.8/dist/vue.global.prod.js
// @grant      GM_addStyle
// ==/UserScript==

(t=>{if(typeof GM_addStyle=="function"){GM_addStyle(t);return}const e=document.createElement("style");e.textContent=t,document.head.append(e)})(" .app-paginator .pagination li{margin-right:0}.better-modhub .features-tabs .tabs{padding-right:0}.better-modhub .reload-button{text-align:center;min-width:70px;padding:0}.features-tabs .tabs-title.reload-button:after{content:none} ");

(function (vue) {
  'use strict';

  const _hoisted_1$3 = { class: "tabs-mods-category-list" };
  const _hoisted_2$3 = ["href"];
  const _sfc_main$3 = {
    __name: "AppCategories",
    setup(__props) {
      const categories = vue.shallowRef([]);
      vue.onMounted(() => {
        const categoriesElements = document.querySelectorAll(
          "body > div > div.box-space > div:nth-child(1) > div.features-tabs.features-tabs--mods > div > ul > li.tabs-mods-category > ul > li > a"
        );
        const cats = [];
        categoriesElements.forEach((el) => {
          cats.push({
            href: el.href,
            name: el.textContent
          });
        });
        categories.value = cats.sort((a, b) => a.name.localeCompare(b.name));
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("ul", _hoisted_1$3, [
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(categories.value, (category, index) => {
            return vue.openBlock(), vue.createElementBlock("li", {
              key: `cat-${index}`
            }, [
              vue.createElementVNode("a", {
                href: category.href
              }, vue.toDisplayString(category.name), 9, _hoisted_2$3)
            ]);
          }), 128))
        ]);
      };
    }
  };
  async function useQueue(callbacks, timeout = 250) {
    return new Promise((resolve) => {
      if (callbacks.length) {
        setTimeout(() => {
          Promise.resolve(callbacks[0]()).then(() => {
            useQueue(callbacks.slice(1), timeout).then(() => {
              resolve();
            });
          });
        }, timeout);
      } else {
        resolve();
      }
    });
  }
  async function useParseCategory(link) {
    return new Promise((resolve) => {
      const baseURL = new URL(link);
      baseURL.searchParams.set("page", "0");
      getDocument(baseURL.href).then((doc) => {
        const nbPages = findNumberOfPages(doc);
        let mods = findPageMods(doc);
        const callbacks = [];
        for (let i = 1; i < nbPages; i++) {
          callbacks.push(async () => {
            const pageURL = new URL(link);
            pageURL.searchParams.set("page", i);
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
    return new DOMParser().parseFromString(html, "text/html");
  }
  function findNumberOfPages(doc) {
    let nbPages = 0;
    const pagesEl = doc.querySelector(
      "body > div > div.box-space > div > div.pagination-wrap > ul "
    );
    if (pagesEl) {
      nbPages = parseInt(pagesEl.lastElementChild.textContent.trim());
    }
    return nbPages;
  }
  function findPageMods(doc) {
    const mods = [];
    const modsEl = doc.querySelectorAll(
      "body > div > div.box-space > div > div > div.mod-item"
    );
    if (modsEl.length) {
      modsEl.forEach((el) => {
        const img = el.querySelector("img").src;
        const href = el.querySelector("div.mod-item__img > a").href;
        const name = el.querySelector("h4").textContent;
        const author = el.querySelector("p > span").textContent;
        const ratingAndDlEl = el.querySelector("div.mod-item__rating-num");
        const ratingAndDl = ratingAndDlEl ? ratingAndDlEl.textContent : "0 (0)";
        let [rating, downloads] = ratingAndDl.split("(");
        rating = parseFloat(rating);
        downloads = parseInt(downloads.replace(/[()\n]/, ""));
        mods.push({
          img,
          href,
          name,
          author,
          rating,
          downloads
        });
      });
    }
    return mods;
  }
  function tryOnScopeDispose(fn) {
    if (vue.getCurrentScope()) {
      vue.onScopeDispose(fn);
      return true;
    }
    return false;
  }
  function toValue(r) {
    return typeof r === "function" ? r() : vue.unref(r);
  }
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";
  typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
  const toString = Object.prototype.toString;
  const isObject = (val) => toString.call(val) === "[object Object]";
  const noop = () => {
  };
  function createFilterWrapper(filter, fn) {
    function wrapper(...args) {
      return new Promise((resolve, reject) => {
        Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args })).then(resolve).catch(reject);
      });
    }
    return wrapper;
  }
  const bypassFilter = (invoke) => {
    return invoke();
  };
  function pausableFilter(extendFilter = bypassFilter) {
    const isActive = vue.ref(true);
    function pause() {
      isActive.value = false;
    }
    function resume() {
      isActive.value = true;
    }
    const eventFilter = (...args) => {
      if (isActive.value)
        extendFilter(...args);
    };
    return { isActive: vue.readonly(isActive), pause, resume, eventFilter };
  }
  function watchWithFilter(source, cb, options = {}) {
    const {
      eventFilter = bypassFilter,
      ...watchOptions
    } = options;
    return vue.watch(
      source,
      createFilterWrapper(
        eventFilter,
        cb
      ),
      watchOptions
    );
  }
  function watchPausable(source, cb, options = {}) {
    const {
      eventFilter: filter,
      ...watchOptions
    } = options;
    const { eventFilter, pause, resume, isActive } = pausableFilter(filter);
    const stop = watchWithFilter(
      source,
      cb,
      {
        ...watchOptions,
        eventFilter
      }
    );
    return { stop, pause, resume, isActive };
  }
  function tryOnMounted(fn, sync = true) {
    if (vue.getCurrentInstance())
      vue.onMounted(fn);
    else if (sync)
      fn();
    else
      vue.nextTick(fn);
  }
  function unrefElement(elRef) {
    var _a;
    const plain = toValue(elRef);
    return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
  }
  const defaultWindow = isClient ? window : void 0;
  function useEventListener(...args) {
    let target;
    let events;
    let listeners;
    let options;
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      [events, listeners, options] = args;
      target = defaultWindow;
    } else {
      [target, events, listeners, options] = args;
    }
    if (!target)
      return noop;
    if (!Array.isArray(events))
      events = [events];
    if (!Array.isArray(listeners))
      listeners = [listeners];
    const cleanups = [];
    const cleanup = () => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    };
    const register = (el, event, listener, options2) => {
      el.addEventListener(event, listener, options2);
      return () => el.removeEventListener(event, listener, options2);
    };
    const stopWatch = vue.watch(
      () => [unrefElement(target), toValue(options)],
      ([el, options2]) => {
        cleanup();
        if (!el)
          return;
        const optionsClone = isObject(options2) ? { ...options2 } : options2;
        cleanups.push(
          ...events.flatMap((event) => {
            return listeners.map((listener) => register(el, event, listener, optionsClone));
          })
        );
      },
      { immediate: true, flush: "post" }
    );
    const stop = () => {
      stopWatch();
      cleanup();
    };
    tryOnScopeDispose(stop);
    return stop;
  }
  const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  const globalKey = "__vueuse_ssr_handlers__";
  const handlers = /* @__PURE__ */ getHandlers();
  function getHandlers() {
    if (!(globalKey in _global))
      _global[globalKey] = _global[globalKey] || {};
    return _global[globalKey];
  }
  function getSSRHandler(key, fallback) {
    return handlers[key] || fallback;
  }
  function guessSerializerType(rawInit) {
    return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
  }
  const StorageSerializers = {
    boolean: {
      read: (v) => v === "true",
      write: (v) => String(v)
    },
    object: {
      read: (v) => JSON.parse(v),
      write: (v) => JSON.stringify(v)
    },
    number: {
      read: (v) => Number.parseFloat(v),
      write: (v) => String(v)
    },
    any: {
      read: (v) => v,
      write: (v) => String(v)
    },
    string: {
      read: (v) => v,
      write: (v) => String(v)
    },
    map: {
      read: (v) => new Map(JSON.parse(v)),
      write: (v) => JSON.stringify(Array.from(v.entries()))
    },
    set: {
      read: (v) => new Set(JSON.parse(v)),
      write: (v) => JSON.stringify(Array.from(v))
    },
    date: {
      read: (v) => new Date(v),
      write: (v) => v.toISOString()
    }
  };
  const customStorageEventName = "vueuse-storage";
  function useStorage(key, defaults, storage, options = {}) {
    var _a;
    const {
      flush = "pre",
      deep = true,
      listenToStorageChanges = true,
      writeDefaults = true,
      mergeDefaults = false,
      shallow,
      window: window2 = defaultWindow,
      eventFilter,
      onError = (e) => {
        console.error(e);
      },
      initOnMounted
    } = options;
    const data = (shallow ? vue.shallowRef : vue.ref)(typeof defaults === "function" ? defaults() : defaults);
    if (!storage) {
      try {
        storage = getSSRHandler("getDefaultStorage", () => {
          var _a2;
          return (_a2 = defaultWindow) == null ? void 0 : _a2.localStorage;
        })();
      } catch (e) {
        onError(e);
      }
    }
    if (!storage)
      return data;
    const rawInit = toValue(defaults);
    const type = guessSerializerType(rawInit);
    const serializer = (_a = options.serializer) != null ? _a : StorageSerializers[type];
    const { pause: pauseWatch, resume: resumeWatch } = watchPausable(
      data,
      () => write(data.value),
      { flush, deep, eventFilter }
    );
    if (window2 && listenToStorageChanges) {
      tryOnMounted(() => {
        useEventListener(window2, "storage", update);
        useEventListener(window2, customStorageEventName, updateFromCustomEvent);
        if (initOnMounted)
          update();
      });
    }
    if (!initOnMounted)
      update();
    return data;
    function write(v) {
      try {
        if (v == null) {
          storage.removeItem(key);
        } else {
          const serialized = serializer.write(v);
          const oldValue = storage.getItem(key);
          if (oldValue !== serialized) {
            storage.setItem(key, serialized);
            if (window2) {
              window2.dispatchEvent(new CustomEvent(customStorageEventName, {
                detail: {
                  key,
                  oldValue,
                  newValue: serialized,
                  storageArea: storage
                }
              }));
            }
          }
        }
      } catch (e) {
        onError(e);
      }
    }
    function read(event) {
      const rawValue = event ? event.newValue : storage.getItem(key);
      if (rawValue == null) {
        if (writeDefaults && rawInit !== null)
          storage.setItem(key, serializer.write(rawInit));
        return rawInit;
      } else if (!event && mergeDefaults) {
        const value = serializer.read(rawValue);
        if (typeof mergeDefaults === "function")
          return mergeDefaults(value, rawInit);
        else if (type === "object" && !Array.isArray(value))
          return { ...rawInit, ...value };
        return value;
      } else if (typeof rawValue !== "string") {
        return rawValue;
      } else {
        return serializer.read(rawValue);
      }
    }
    function updateFromCustomEvent(event) {
      update(event.detail);
    }
    function update(event) {
      if (event && event.storageArea !== storage)
        return;
      if (event && event.key == null) {
        data.value = rawInit;
        return;
      }
      if (event && event.key !== key)
        return;
      pauseWatch();
      try {
        if ((event == null ? void 0 : event.newValue) !== serializer.write(data.value))
          data.value = read(event);
      } catch (e) {
        onError(e);
      } finally {
        if (event)
          vue.nextTick(resumeWatch);
        else
          resumeWatch();
      }
    }
  }
  const _hoisted_1$2 = { class: "pagination-wrap app-paginator" };
  const _hoisted_2$2 = ["onClick"];
  const _hoisted_3$2 = {
    class: "pagination text-center clearfix",
    role: "navigation",
    "aria-label": "Pagination"
  };
  const _hoisted_4$2 = {
    key: 0,
    class: "dots"
  };
  const _hoisted_5$2 = { key: 1 };
  const _hoisted_6$2 = ["aria-label", "onClick"];
  const _hoisted_7$2 = ["onClick"];
  const maxPages = 7;
  const _sfc_main$2 = {
    __name: "AppPaginator",
    props: {
      modelValue: {
        type: Number,
        required: true
      },
      pageCount: {
        type: Number,
        required: true
      }
    },
    emits: ["update:modelValue"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const currentPage = vue.computed({
        get() {
          return props.modelValue;
        },
        set(value) {
          emit("update:modelValue", value);
        }
      });
      const pages = vue.computed(() => {
        const pgs = [];
        if (props.pageCount <= maxPages) {
          for (let i = 1; i <= props.pageCount; i++) {
            pgs.push({
              isCurrent: currentPage.value === i,
              value: i,
              label: `Page ${i}`,
              isDot: false
            });
          }
        } else {
          if (currentPage.value < maxPages - 2) {
            for (let i = 1; i <= maxPages - 2; i++) {
              pgs.push({
                isCurrent: currentPage.value === i,
                value: i,
                label: `Page ${i}`,
                isDot: false
              });
            }
            pgs.push({
              isCurrent: false,
              value: 0,
              label: "",
              isDot: true
            });
            pgs.push({
              isCurrent: false,
              value: props.pageCount,
              label: `Page ${props.pageCount}`,
              isDot: false
            });
          } else if (currentPage.value > props.pageCount - (maxPages - 3)) {
            pgs.push({
              isCurrent: false,
              value: 1,
              label: "Page 1",
              isDot: false
            });
            pgs.push({
              isCurrent: false,
              value: 0,
              label: "",
              isDot: true
            });
            for (let i = props.pageCount - (maxPages - 3); i <= props.pageCount; i++) {
              pgs.push({
                isCurrent: currentPage.value === i,
                value: i,
                label: `Page ${i}`,
                isDot: false
              });
            }
          } else {
            pgs.push({
              isCurrent: false,
              value: 1,
              label: "Page 1",
              isDot: false
            });
            pgs.push({
              isCurrent: false,
              value: 0,
              label: "",
              isDot: true
            });
            for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
              pgs.push({
                isCurrent: currentPage.value === i,
                value: i,
                label: `Page ${i}`,
                isDot: false
              });
            }
            pgs.push({
              isCurrent: false,
              value: 0,
              label: "",
              isDot: true
            });
            pgs.push({
              isCurrent: false,
              value: props.pageCount,
              label: `Page ${props.pageCount}`,
              isDot: false
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
        url.searchParams.set("page", value - 1);
        history.replaceState(null, "", url);
      }
      function returnToTop() {
        window.scrollTo({
          top: 525,
          behavior: "smooth"
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, [
          vue.createElementVNode("div", {
            class: vue.normalizeClass(["pagination-previous", { disabled: currentPage.value === 1 }])
          }, [
            currentPage.value !== 1 ? (vue.openBlock(), vue.createElementBlock("a", {
              key: 0,
              href: "#",
              "aria-label": "Previous page",
              onClick: vue.withModifiers(previous, ["stop", "prevent"])
            }, null, 8, _hoisted_2$2)) : vue.createCommentVNode("", true)
          ], 2),
          vue.createElementVNode("ul", _hoisted_3$2, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(pages.value, (page) => {
              return vue.openBlock(), vue.createElementBlock("li", {
                key: page.value,
                class: vue.normalizeClass({ current: page.isCurrent })
              }, [
                page.isDot ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_4$2, "...")) : page.isCurrent ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_5$2, vue.toDisplayString(page.value), 1)) : (vue.openBlock(), vue.createElementBlock("a", {
                  key: 2,
                  href: "#",
                  "aria-label": page.label,
                  onClick: vue.withModifiers(($event) => clickOnPage(page.value), ["prevent", "stop"])
                }, vue.toDisplayString(page.value), 9, _hoisted_6$2))
              ], 2);
            }), 128))
          ]),
          vue.createElementVNode("div", {
            class: vue.normalizeClass(["pagination-next", { disabled: currentPage.value === __props.pageCount }])
          }, [
            currentPage.value !== __props.pageCount ? (vue.openBlock(), vue.createElementBlock("a", {
              key: 0,
              href: "#",
              "aria-label": "Next page",
              onClick: vue.withModifiers(next, ["stop", "prevent"])
            }, null, 8, _hoisted_7$2)) : vue.createCommentVNode("", true)
          ], 2)
        ]);
      };
    }
  };
  const _hoisted_1$1 = { key: 0 };
  const _hoisted_2$1 = { class: "row" };
  const _hoisted_3$1 = { class: "mod-item" };
  const _hoisted_4$1 = { class: "mod-item__img" };
  const _hoisted_5$1 = ["href"];
  const _hoisted_6$1 = ["src"];
  const _hoisted_7$1 = { class: "mod-item__content" };
  const _hoisted_8$1 = { class: "mods-rating clearfix" };
  const _hoisted_9$1 = { class: "mod-item__rating-num" };
  const _hoisted_10$1 = ["href"];
  const _hoisted_11 = { class: "row column" };
  const _hoisted_12 = /* @__PURE__ */ vue.createElementVNode("div", { class: "row column" }, "Fetching...", -1);
  const _hoisted_13 = [
    _hoisted_12
  ];
  const modsPerPages = 24;
  const _sfc_main$1 = {
    __name: "AppModsList",
    props: {
      mods: {
        type: Array,
        required: true
      },
      sortBy: {
        type: String,
        required: true
      },
      fetching: {
        type: Boolean,
        default: false
      }
    },
    setup(__props) {
      const props = __props;
      const searchParams = new URLSearchParams(window.location.search);
      const currentPageParam = searchParams.get("page") === null ? 1 : parseInt(searchParams.get("page")) + 1;
      const currentPage = vue.shallowRef(currentPageParam);
      const isVisible = vue.computed(() => {
        return props.sortBy !== "default";
      });
      const pageCount = vue.computed(() => {
        return Math.ceil(props.mods.length / modsPerPages);
      });
      const modsSorted = vue.computed(() => {
        let modsSorted2 = [];
        if (props.sortBy === "top") {
          modsSorted2 = props.mods.toSorted((a, b) => b.downloads - a.downloads);
        } else if (props.sortBy === "alpha") {
          modsSorted2 = props.mods.toSorted((a, b) => a.name.localeCompare(b.name));
        }
        return modsSorted2.map((mod) => {
          const semiRoundedStar = Math.round(mod.rating * 2) / 2;
          const floorStar = Math.floor(semiRoundedStar);
          const stars = [];
          for (let i = 1; i < 6; i++) {
            const classes = [];
            if (i > floorStar) {
              if (i - semiRoundedStar < 1 && semiRoundedStar % floorStar) {
                classes.push("half");
              } else {
                classes.push("grey");
              }
            }
            stars.push(classes);
          }
          return {
            ...mod,
            stars
          };
        });
      });
      const modsPaginated = vue.computed(() => {
        return modsSorted.value.slice(
          (currentPage.value - 1) * 24,
          currentPage.value * 24
        );
      });
      vue.watchEffect(() => {
        const defaultElements = document.querySelectorAll(
          "body > div > div.box-space > div.row"
        );
        if (isVisible.value) {
          defaultElements.forEach((el, index) => {
            if (index > 0) {
              el.style.display = "none";
            }
          });
        } else {
          defaultElements.forEach((el, index) => {
            if (index > 0) {
              el.style.display = "block";
            }
          });
        }
      });
      vue.watch(
        () => props.sortBy,
        () => {
          currentPage.value = 1;
          const url = new URL(window.location);
          url.searchParams.set("page", 0);
          history.replaceState(null, "", url);
        }
      );
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(vue.Teleport, { to: "body > div > div.box-space" }, [
          isVisible.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
            vue.withDirectives(vue.createElementVNode("div", null, [
              vue.createElementVNode("div", _hoisted_2$1, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(modsPaginated.value, (mod, index) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: `mod-${index}`,
                    class: "medium-6 large-3 columns"
                  }, [
                    vue.createElementVNode("div", _hoisted_3$1, [
                      vue.createElementVNode("div", _hoisted_4$1, [
                        vue.createElementVNode("a", {
                          href: mod.href
                        }, [
                          vue.createElementVNode("img", {
                            src: mod.img
                          }, null, 8, _hoisted_6$1)
                        ], 8, _hoisted_5$1)
                      ]),
                      vue.createElementVNode("div", _hoisted_7$1, [
                        vue.createElementVNode("h4", null, vue.toDisplayString(mod.name), 1),
                        vue.createElementVNode("p", null, [
                          vue.createElementVNode("span", null, vue.toDisplayString(mod.author), 1)
                        ]),
                        vue.createElementVNode("div", _hoisted_8$1, [
                          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(mod.stars, (star, startIndex) => {
                            return vue.openBlock(), vue.createElementBlock("span", {
                              key: `star-${startIndex}`,
                              class: vue.normalizeClass([star, "icon-star"])
                            }, null, 2);
                          }), 128))
                        ]),
                        vue.createElementVNode("div", _hoisted_9$1, vue.toDisplayString(mod.rating) + " (" + vue.toDisplayString(mod.downloads) + ") ", 1)
                      ]),
                      vue.createElementVNode("a", {
                        href: mod.href,
                        class: "button button-buy button-middle button-no-margin expanded"
                      }, " MORE INFO ", 8, _hoisted_10$1)
                    ])
                  ]);
                }), 128))
              ]),
              vue.createElementVNode("div", _hoisted_11, [
                vue.createVNode(_sfc_main$2, {
                  modelValue: currentPage.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => currentPage.value = $event),
                  "page-count": pageCount.value
                }, null, 8, ["modelValue", "page-count"])
              ])
            ], 512), [
              [vue.vShow, !__props.fetching]
            ]),
            vue.withDirectives(vue.createElementVNode("div", null, _hoisted_13, 512), [
              [vue.vShow, __props.fetching]
            ])
          ])) : vue.createCommentVNode("", true)
        ]);
      };
    }
  };
  const _hoisted_1 = { class: "row column better-modhub" };
  const _hoisted_2 = { class: "features-tabs features-tabs--mods" };
  const _hoisted_3 = { class: "clearfix" };
  const _hoisted_4 = { class: "nav-title" };
  const _hoisted_5 = { class: "tabs" };
  const _hoisted_6 = ["onClick"];
  const _hoisted_7 = { class: "tabs-title float-right reload-button" };
  const _hoisted_8 = { class: "tabs-title is-parent tabs-mods-category float-right" };
  const _hoisted_9 = /* @__PURE__ */ vue.createElementVNode("span", null, "Categories", -1);
  const _hoisted_10 = [
    _hoisted_9
  ];
  const _sfc_main = {
    __name: "App",
    setup(__props) {
      const disabledFilters = ["most", "crossplay", "latest"];
      const filter = vue.shallowRef(null);
      const fetching = vue.shallowRef(false);
      const mods = vue.shallowRef([]);
      const searchParams = new URLSearchParams(window.location.search);
      let activeTabParam = "";
      if (searchParams.get("sort")) {
        activeTabParam = searchParams.get("sort");
      } else {
        activeTabParam = "default";
        changeSortQueryParam("default");
      }
      const activeTab = vue.shallowRef(activeTabParam);
      const dynamicDisabled = vue.computed(
        () => !filter.value || disabledFilters.includes(filter.value)
      );
      const dynamicTabs = vue.computed(() => {
        const defaultTab = {
          value: "default",
          name: "DEFAULT"
        };
        if (!dynamicDisabled.value) {
          return [
            defaultTab,
            {
              value: "top",
              name: "Top 🠗"
            },
            {
              value: "alpha",
              name: "A-Z 🠕"
            }
          ];
        }
        return [defaultTab];
      });
      vue.onMounted(async () => {
        filter.value = searchParams.get("filter");
        await fetchMods();
      });
      function chooseSort(sortBy) {
        activeTab.value = sortBy;
        changeSortQueryParam(sortBy);
      }
      async function fetchMods(refetch = false) {
        var _a;
        if (!dynamicDisabled.value) {
          const storedData = useStorage(filter.value, [], void 0, {
            shallow: true
          });
          if (!((_a = storedData.value) == null ? void 0 : _a.length) || refetch) {
            storedData.value = await fetchData();
          }
          mods.value = storedData.value;
        }
      }
      async function fetchData() {
        if (!dynamicDisabled.value) {
          console.log("fetching mods...");
          fetching.value = true;
          const data = await useParseCategory(window.location);
          fetching.value = false;
          return data;
        }
      }
      function changeSortQueryParam(sort) {
        const url = new URL(window.location);
        url.searchParams.set("sort", sort);
        history.replaceState({}, "", url);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
          vue.createElementVNode("div", _hoisted_2, [
            vue.createElementVNode("div", _hoisted_3, [
              vue.createElementVNode("h3", _hoisted_4, [
                vue.createElementVNode("a", {
                  href: "#",
                  onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
                  }, ["stop", "prevent"]))
                }, "MODS++")
              ]),
              vue.createElementVNode("ul", _hoisted_5, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(dynamicTabs.value, (tab) => {
                  return vue.openBlock(), vue.createElementBlock("li", {
                    key: tab.value,
                    class: vue.normalizeClass(["tabs-title", { "is-active": tab.value === activeTab.value }])
                  }, [
                    vue.createElementVNode("a", {
                      href: "#",
                      onClick: vue.withModifiers(($event) => chooseSort(tab.value), ["stop", "prevent"])
                    }, vue.toDisplayString(tab.name), 9, _hoisted_6)
                  ], 2);
                }), 128)),
                vue.withDirectives(vue.createElementVNode("li", _hoisted_7, [
                  vue.createElementVNode("a", {
                    href: "#",
                    onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => fetchMods(true), ["stop", "prevent"]))
                  }, "⟳")
                ], 512), [
                  [vue.vShow, !dynamicDisabled.value]
                ]),
                vue.createElementVNode("li", _hoisted_8, [
                  vue.createElementVNode("a", {
                    href: "#",
                    onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
                    }, ["stop", "prevent"]))
                  }, _hoisted_10),
                  vue.createVNode(_sfc_main$3)
                ])
              ])
            ])
          ]),
          vue.createVNode(_sfc_main$1, {
            "sort-by": activeTab.value,
            mods: mods.value,
            fetching: fetching.value
          }, null, 8, ["sort-by", "mods", "fetching"])
        ]);
      };
    }
  };
  vue.createApp(_sfc_main).mount(
    (() => {
      const navEl = document.querySelector(
        "body > div > div.box-space > div:nth-child(1)"
      );
      const app = document.createElement("div");
      navEl.after(app);
      return app;
    })()
  );

})(Vue);