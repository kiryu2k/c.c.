import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/router.js';
import 'bootstrap/dist/css/bootstrap.css';
import * as bootstrap from 'bootstrap';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

window.bootstrap = bootstrap;

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount('#app');
