import { createApp } from 'vue'
import Test from './Test.vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components,
    directives,
});

const testApp = createApp(Test)

testApp.use(vuetify);

testApp.mount('#test')