<template>
    <RouterView />
</template>

<style lang="css">
.hide-scroll {
    flex: 1 1 auto;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.hide-scroll::-webkit-scrollbar {
  display: none;
}
</style>