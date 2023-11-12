import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount(
  (() => {
    const navEl = document.querySelector(
      'body > div > div.box-space > div:nth-child(1)',
    );
    const app = document.createElement('div');
    navEl.after(app);
    return app;
  })(),
);
