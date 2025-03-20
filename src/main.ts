import { createApp } from 'vue';
import { registerPlugins } from '@/plugins';
import App from './App.vue';
import './style.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import 'driver.js/dist/driver.css';
import '@/router/nav-guard';

const app = createApp(App);
registerPlugins(app);

app.mount('#app');
