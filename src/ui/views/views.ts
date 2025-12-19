import { createApp } from 'vue'
import Collection from './Collection.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
    // theme: {
    //     defaultTheme: 'dark', // 'light' | 'dark' | 'system'
    // },
});

const collectionApp = createApp(Collection)

collectionApp.use(vuetify);

collectionApp.mount('#view')