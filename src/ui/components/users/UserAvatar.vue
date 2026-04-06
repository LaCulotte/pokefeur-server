<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import sha256 from 'crypto-js/sha256';

const avatarUrl: Ref<string | undefined> = ref(undefined);

const { username, size = 128 } = defineProps<{
    username: string | undefined,
    size?: number
}>()

async function computeAvatarUrl(newUsername: string | undefined) {
    if (newUsername) {
        const hash = await sha256(newUsername);
        avatarUrl.value = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    } else {
        avatarUrl.value = undefined;
    }
}

onMounted(() => {
    computeAvatarUrl(username);
});

watch(() => username, computeAvatarUrl);
</script>

<template>
    <v-avatar
        :size="size"
    >
        <v-img
            v-if="avatarUrl"
            :src="avatarUrl"
        />
        <v-skeleton-loader
            v-else
            type="image"
            :width="size"
            :height="size"
        />
    </v-avatar>
</template>