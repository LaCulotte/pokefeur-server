import { createApp } from 'vue'
import Collection from './Collection.vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
});

const collectionApp = createApp(Collection)

collectionApp.use(vuetify);

collectionApp.mount('#view')