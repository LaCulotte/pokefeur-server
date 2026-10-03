<template>
    <div
        class="my-badge px-1"
    >
        <slot />
    </div>
</template>

<style scoped>
.my-badge {
    position: absolute;
    
    padding-right: 4px;
    padding-left: 4px;
    
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    top: 2px;
    right: 2px;
    border: solid 1px rgb(var(--v-theme-on-surface-variant));
    border-radius: 24px;
}
</style>