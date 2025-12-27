import { createApp } from 'vue';
import App from './App.vue';
import Room from './views/Room.vue';
import Collection from './views/Collection.vue';
import Login from './views/Login.vue';

// Vuetify
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Router
import { createWebHistory, createRouter } from 'vue-router';
import { user } from './data/user/vueUserData';

const routes = [
  { path: '/', component: Room },
  { path: '/collection', component: Collection },
  { path: '/login', component: Login },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
    if (!(await user.isAuthenticated()) && to.path !== '/login') {
        return { path: '/login' }
    }
});

const vuetify = createVuetify({
    components,
    directives,
});

const collectionApp = createApp(App);

collectionApp.use(vuetify);
collectionApp.use(router);

collectionApp.mount('#app');