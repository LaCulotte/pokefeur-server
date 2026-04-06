<script setup lang="ts">
import { computed } from 'vue';
import type { UserSearchResult } from '../../../api/model/interfaces';
import UserAvatar from './UserAvatar.vue';

const props = defineProps<{
    res: UserSearchResult
}>();

const emit = defineEmits<{
    "click": []
}>();

const displayedDescription = computed(() => {
    return !!props.res.description ? props.res.description : '...';
});
</script>

<template>
    <v-card
        :title="props.res.username"
        :subtitle="displayedDescription"
        @click="$emit('click')"
    >
        <template v-slot:prepend>
            <user-avatar
                :username="props.res.username"
                :size="48"
            />
        </template>
    </v-card>
    <v-divider />
</template>