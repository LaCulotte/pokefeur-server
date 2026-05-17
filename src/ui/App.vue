<script lang="ts" setup>
import type { SupportedLanguages } from "../../resources/interfaces";
import { LANGS } from "../common/constants";
import { lang } from "./controller/lang";

const urlLang = new URLSearchParams(window.location.search).get("lang");
if (urlLang && LANGS.includes(urlLang as SupportedLanguages)) {
    lang.value = urlLang as SupportedLanguages;
}
</script>

<template>
    <router-view />
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