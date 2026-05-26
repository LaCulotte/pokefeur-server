<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGoTo } from "vuetify";

const router = useRouter();
const goTo = useGoTo();

const {
    itemCount,
    minItemHeightRatio,
    maxItemHeightRatio,
    scrollElem = undefined,
    compact = false,    // TODO: change padding ?
    focusItemIndex = undefined,
} = defineProps<{
    itemCount: number,
    minItemHeightRatio: number,
    maxItemHeightRatio: number,
    scrollElem?: HTMLDivElement | null,
    compact?: boolean,
    focusItemIndex?: number,
}>();

defineEmits(['item-click']);

const ASPECT_RATIO = 245/337;

const mainElem = useTemplateRef("main");

// TODO : handle resize
const height = computed(() => {
    return /* scrollElem?.getBoundingClientRect().height ?? */ window.visualViewport?.height ?? window.innerHeight;
});
const width = computed(() => {
    return mainElem.value?.getBoundingClientRect().width ?? window.visualViewport?.width ?? window.innerWidth;
});

const minItemHeight = computed(() => {
    return height.value * minItemHeightRatio;
});
const maxItemHeight = computed(() => {
    return height.value * maxItemHeightRatio;
});

let padding = 4;
const numCols = computed(() => {
    let minWidth = (minItemHeight.value * ASPECT_RATIO);
    padding = Math.floor(minWidth / 33);

    minWidth += padding * 2;
    return Math.ceil(width.value / minWidth);
});

const minWidth = computed(() => minItemHeight.value * ASPECT_RATIO);

const itemSize = computed(() => {
    const maxWidth = (width.value / numCols.value) - padding * 2;
    let calcHeight = maxWidth / ASPECT_RATIO;

    if (calcHeight > maxItemHeight.value) {
        calcHeight = maxItemHeight.value;
    }

    const calcWidth = calcHeight * ASPECT_RATIO;
    return { width: calcWidth, height: calcHeight };
});

const numRows = computed(() => {
    return Math.ceil(itemCount / numCols.value);
});

const ROW_MARGIN = 2;

// TODO : in a 'watch' with refs, more efficient
const numVirtRows = computed(() => {
    return Math.ceil(height.value / itemSize.value.height) + ROW_MARGIN * 2;
});

const mainSize = computed(() => {
    return numRows.value * itemSize.value.height;
});

const firstElem = ref(0);
const translateMain = ref(0);

const numElems = computed(() => {
    return numCols.value * (numVirtRows.value + ROW_MARGIN * 2);
});

const maxFirstElem = computed(() => {
    if (itemCount < numElems.value) {
        return 0;
    }

    let itemsInView = numCols.value * (numVirtRows.value + ROW_MARGIN);
    if (itemCount % numCols.value != 0)  {
        itemsInView += (itemCount % numCols.value) - numCols.value;
    }

    return itemCount - itemsInView;
});

const currNumElems = computed(() => {
    if (itemCount < firstElem.value) {
        return 0;
    } else if (firstElem.value + numElems.value >= itemCount) {
        return itemCount - firstElem.value;
    } else {
        return numElems.value;
    }
});

function scrollBehaviour() {
    if (mainElem.value === null) {
        return;
    }

    const mainTop = mainElem.value.getBoundingClientRect().top;
    if (mainTop > -ROW_MARGIN * itemSize.value.height) {
        translateMain.value = 0;
        firstElem.value = 0;    // Check if this triggers a recompute;
        return;
    }

    const numRowAbove = -Math.ceil(mainTop / itemSize.value.height);
    const numRowBegin = numRowAbove - ROW_MARGIN;
    firstElem.value = numRowBegin * numCols.value;

    translateMain.value = numRowBegin * itemSize.value.height;

    if (firstElem.value >= maxFirstElem.value) {
        firstElem.value = maxFirstElem.value;
        translateMain.value = (firstElem.value / numCols.value) * itemSize.value.height;
    }
}

const itemStyle = computed(() => {
    return {        
        height: `${itemSize.value.height}px`,
        // width: `${itemSize.value.width}px`,
        'grid-column': 'span 1',
        padding: `${padding}px`
    };
});

const mainStyle = computed(() => {
    return {        
        height: `${mainSize.value}px`,
        width: '100%'
    };
});

const gridStyle = computed(() => {
    return {        
        display: 'grid',
        'grid-template-columns': `repeat(${numCols.value}, 1fr)`,
        transform: `translateY(${translateMain.value}px)`
    };
});

async function focusItem(itemIndex: number | undefined) {
    if (itemIndex === undefined || itemIndex < 0 || itemIndex > itemCount) {
        return;
    }

    const offset = (mainElem.value?.getBoundingClientRect().top ?? 0)
                    - (scrollElem?.getBoundingClientRect().top ?? 0) 
                    + (scrollElem ?? document.body).scrollTop;
    const dest = Math.floor((itemIndex / numCols.value)) * itemSize.value.height - 0;
    const currTop = scrollElem?.scrollTop ?? 0;

    if ((dest - currTop) > 2 * height.value) {
        (scrollElem ?? window).scrollTo({
            top: dest - (2 * height.value),
            behavior: "auto",
        });
        // goTo(dest, {
        //     offset: (2 * height.value),
        //     container: (scrollElem ?? document.body),
        //     duration: 0
        // });
    }

    goTo(dest, {
        // offset: itemSize.value.height,
        container: (scrollElem ?? document.body),
    });

    // setTimeout(() => console.log((scrollElem ?? document.body).scrollTop), 1000);
}

watch(() => focusItemIndex, (newItemIndex: number | undefined) => {
    focusItem(newItemIndex);
});

// TODO : use other lifecycle operator !!
onMounted(async () => {
    nextTick(() => {
        if (!!scrollElem) {
            scrollElem.addEventListener("scroll", scrollBehaviour);
        } else {
            document.addEventListener("scroll", scrollBehaviour);
        }

        scrollBehaviour();
    });

    nextTick(() => {focusItem(focusItemIndex);});
});

onUnmounted(() => {
    if (!!scrollElem) {
        scrollElem.removeEventListener("scroll", scrollBehaviour);
    } else {
        document.removeEventListener("scroll", scrollBehaviour);
    }
});
</script>

<template>
    <div
        :style="mainStyle"
        ref="main"
    >
        <div
            class="w-100 align-content-start ma-0"
            :style="gridStyle"
            v-if="itemCount > 0"
        >
            <div
                v-for="i in currNumElems"
                class="w-100 d-flex justify-center align-center"
                :style="itemStyle"
                :key="i + firstElem"
            >
                <slot :i="i + firstElem - 1" />
            </div>
        </div>
    </div>
</template>

<style>
.border-smooth {
    border: solid 3px red;
    transition: border 500ms ease;
    will-change: boder;
}
.border-smooth.border-hide {
    border: solid 3px rgba(0,0,0,0);
}
</style>