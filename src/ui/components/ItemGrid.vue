<script setup lang="ts">

import type { InventoryItem } from '../../api/model/interfaces';
import Item from './Item.vue';

import { computed, onMounted, onUnmounted, ref, useTemplateRef, type ComputedRef, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const {items, minItemHeightRatio, maxItemHeightRatio, scrollElem, compact = false} = defineProps<{
    items: Array<InventoryItem>,
    minItemHeightRatio: number,
    maxItemHeightRatio: number,
    scrollElem?: HTMLDivElement | null,
    compact?: boolean
}>();

const ASPECT_RATIO = 245/337;

const mainElem = useTemplateRef("main");

// TODO : handle resize
const height = computed(() => {
    return window.visualViewport?.height ?? window.innerHeight
});
const width = computed(() => {
    return mainElem.value?.getBoundingClientRect().width ?? window.visualViewport?.width ?? window.innerWidth
});

const minItemHeight = computed(() => {
    return height.value * minItemHeightRatio; 
})
const maxItemHeight = computed(() => {
    return height.value * maxItemHeightRatio; 
})

const numCols = computed(() => {
    let minWidth = (minItemHeight.value * ASPECT_RATIO) + 8;
    return Math.ceil(width.value / minWidth);
});

const itemSize = computed(() => {
    let maxWidth = (width.value / numCols.value) - 8;
    let calcHeight = maxWidth / ASPECT_RATIO;

    if (calcHeight > maxItemHeight.value) {
        calcHeight = maxItemHeight.value;
    }

    let calcWidth = calcHeight * ASPECT_RATIO;
    return { width: calcWidth, height: calcHeight };
});

const numRows = computed(() => {
    return Math.ceil(items.length / numCols.value);
});

const ROW_MARGIN = 2;

// TODO : in a 'watch' with refs, more efficient
const numVirtRows = computed(() => {
    return Math.ceil(height.value / itemSize.value.height) + ROW_MARGIN * 2;
});

const firstElem = ref(0);
const translateMain = ref(0);

// const 

function scrollBehaviour() {
    console.log("scroll")
    if (mainElem.value === null) {
        return;
    }

    let mainTop = mainElem.value.getBoundingClientRect().top;
    if (mainTop > -ROW_MARGIN * itemSize.value.height) {
        translateMain.value = 0;
        firstElem.value = 0;    // Check if this triggers a recompute;
        return;
    }

    let numRowAbove = -Math.ceil(mainTop / itemSize.value.height);
    let numRowBegin = numRowAbove - ROW_MARGIN;
    firstElem.value = numRowBegin * numCols.value;

    translateMain.value = numRowBegin * itemSize.value.height;
}

const shownItems: ComputedRef<Array<InventoryItem>> = computed(() => {
    let ret: Array<InventoryItem> = [];

    let maxElem = firstElem.value + numCols.value * (numVirtRows.value + ROW_MARGIN * 2);
    if (maxElem > items.length) {
        maxElem = items.length;
    }

    for (let i = firstElem.value; i < maxElem; i++) {
        ret.push(items[i]!);
    }


    return ret;
});

const itemStyle = computed(() => {
    return `
    height: ${itemSize.value.height}px;
    width: ${itemSize.value.width}px;
    grid-column: span 1;
    `;
});

const mainStyle = computed(() => {
    return `
    height: ${numRows.value * itemSize.value.height}px;
    width: 100%;
    `;
});

const gridStyle = computed(() => {
    return `
    display: grid;
    grid-template-columns: repeat(${numCols.value}, 1fr);
    transform: translateY(${translateMain.value}px)
    `;
});

const focusedClass = ref(["border-smooth"]);
const focusedUid: Ref<string|undefined> = ref(undefined);

// TODO : use other lifecycle operator !!
onMounted(async () => {
    setTimeout(() => {
        if (!!scrollElem) {
            scrollElem.addEventListener("scroll", scrollBehaviour);
        } else {
            document.addEventListener("scroll", scrollBehaviour);
        }

        scrollBehaviour();
        let focusedItemId = router.currentRoute.value.query.itemId;
        if (focusedItemId !== undefined) {
            focusedUid.value = focusedItemId!.toString();

            let itemIndex = items.findIndex((item) => { return item.uid == focusedItemId; })

            if (itemIndex != -1) {
                let dest = Math.floor((itemIndex / numCols.value) * itemSize.value.height);

                if (dest > 3 * height.value) {
                    (scrollElem ?? window).scrollTo({
                        top: dest - (3 * height.value),
                        behavior: "auto",
                    });
                }

                (scrollElem ?? window).scrollTo({
                    top: dest,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    // document.getElementById(`${to.hash.slice(1, to.hash.length)}-overlay`)?.classList.add("border-smooth");
                    focusedClass.value.push("border-hide");
                }, 1500);
            }
        }
    }, 200);
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
<div>
<div :style="mainStyle" ref="main">
    <div class="w-100 align-content-start ma-0" :style="gridStyle">
        <div
        v-for="obj of shownItems"
        :cols="Math.ceil(12 / numCols)"
        class="w-100 d-flex justify-center align-center"
        style="padding: 4px;"
        :style="itemStyle"
        :key="obj.uid"
        >
            <item :id="obj.uid" :item="obj" :key="obj.uid">
                <template v-slot:common-content="{ item }">
                    <slot name="common-content" :item="item"></slot>
                        <div
                        class="position-absolute top-0 h-100 w-100"
                        :class="obj.uid == focusedUid ? focusedClass : []"
                        style="pointer-events: none"
                        >
                        </div>
                </template>

                <template v-slot:booster-content="{ booster }">
                    <slot name="booster-content" :booster="booster"></slot>
                </template>

                <template v-slot:card-content="{ card }">
                    <slot name="card-content" :card="card"></slot>
                </template>
            </item>
        </div>
        <!-- <slot :style="`grid-column: span ${numCols};`" name="after-grid"></slot> -->
    </div>
</div>
<slot name="after-grid"></slot>
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