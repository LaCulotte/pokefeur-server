<script setup lang="ts" generic="T">
defineOptions({ inheritAttrs: false });
const props = defineProps<{ scope: T }>();
</script>

<template>
    <slot v-bind="$props.scope" />
</template>