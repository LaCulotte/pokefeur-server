import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  pluginVue.configs['flat/strongly-recommended'],
  vueTsConfigs.recommended,

  {
    rules: {
      "vue/html-indent": ["error", 4],
      "vue/v-slot-style": ["error", {
        "atComponent": "v-slot",
        "default": "v-slot",
        "named": "longform",
      }],
      "vue/no-unused-vars": ["error", {
        "ignorePattern": "^_"
      }],
      "@typescript-eslint/no-unused-vars": ["off"],
      "vue/multi-word-component-names": ["off"]
    }
  }
)