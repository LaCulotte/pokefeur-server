import { createApp } from 'vue';
import App from './App.vue';
import Room from './views/Room.vue';
import Collection from './views/Collection.vue';
import Login from './views/Login.vue';
import Dealership from './views/Dealership.vue';
import Profile from './views/Profile.vue';
import ProfileEdit from './views/ProfileEdit.vue';
import UserSearch from './views/UserSearch.vue';
import Trades from './views/Trades.vue';
import TradeShow from './views/TradeShow.vue';
import TradeCreate from './views/TradeCreate.vue';
import TradeCounter from './views/TradeCounter.vue';

// Vuetify
import '@mdi/font/css/materialdesignicons.css';

import 'vuetify/styles/main.css';
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
    { path: '/profile', component: Profile },
    { path: '/profile-edit', component: ProfileEdit },
    { path: '/user-search', component: UserSearch },
    { path: '/trade-user-search', component: UserSearch, props: { forTrade: true } },
    { path: '/trades', component: Trades },
    { path: '/view-trade-proposal/:proposalUid', component: TradeShow, props: true, name: 'view-trade-proposal' },
    { path: '/create-trade-proposal/:userUid', component: TradeCreate, props: true, name: 'create-trade-proposal' },
    { path: '/counter-trade-proposal/:proposalUid', component: TradeCounter, props: true, name: 'counter-trade-proposal' },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    if (!(await user.isAuthenticated()) && to.path !== '/login') {
        localStorage.setItem("login-dest", to.path);
        return { path: '/login' };
    } else if (to.path !== '/login') {
        localStorage.removeItem("login-dest");
    }
});

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
    },
    defaults: {
        VBtn: {
        class: 'text-uppercase',
        },
    },
});

const collectionApp = createApp(App);

collectionApp.use(vuetify);
collectionApp.use(router);

collectionApp.mount('#app');
