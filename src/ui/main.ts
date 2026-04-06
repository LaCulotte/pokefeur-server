import { createApp } from 'vue';
import App from './App.vue';
import Room from './views/Room.vue';
import Collection from './views/Collection.vue';
import Login from './views/Login.vue';
import Dealership from './views/Dealership.vue';
import ProfileEdit from './views/ProfileEdit.vue';
import UserSearch from './views/UserSearch.vue';

// Vuetify
import '@mdi/font/css/materialdesignicons.css';

//@ts-expect-error I don't know why the compiler complains about this
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
    { path: '/dealership', component: Dealership },
    { path: '/profile-edit', component: ProfileEdit },
    { path: '/user-search', component: UserSearch },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    if (!(await user.isAuthenticated()) && to.path !== '/login') {
        localStorage.setItem("login-dest", to.path);
        return { path: '/login' }
    } else if (to.path !== '/login') {
        localStorage.removeItem("login-dest");
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