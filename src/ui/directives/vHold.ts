import type { ObjectDirective } from 'vue';

// type HoldOptions = {
//   handler: (event: PointerEvent) => void
//   delay?: number
// };

const DEFAULT_DELAY = 500;

type HoldBinding = (event: PointerEvent) => void;

type HoldElement = HTMLElement & {
  __holdCleanup?: () => void
};

export type HoldDirective = ObjectDirective<HoldElement, HoldBinding>;

declare module 'vue' {
  export interface GlobalDirectives {
    vHold: HoldDirective
  }
}


export const vHold: HoldDirective  = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pointerId: number | undefined;

    let suppressClick = false;

    let delay = parseInt(binding.arg ?? DEFAULT_DELAY);
    if (isNaN(delay)) {
        console.warn(`v-hold arg is not a valid int (${binding.arg}); Using default delay value to ${DEFAULT_DELAY}ms`);
        delay = DEFAULT_DELAY;
    }

    const start = (event: PointerEvent) => {
      // Ignore secondary mouse buttons
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      // Prevent multiple simultaneous timers
      if (timer !== undefined) {
        return;
      }

      pointerId = event.pointerId;
      suppressClick = false;

      timer = setTimeout(() => {
        suppressClick = true;
        timer = undefined;
        binding.value(event);
      }, delay);
    };

    const cancel = (event?: PointerEvent) => {
      if (
        event &&
        pointerId !== undefined &&
        event.pointerId !== pointerId
      ) {
        return;
      }

      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }

      pointerId = undefined;
    };

    const preventContextMenu = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log("salut");
    };

    // Uncomment if the event should fire after the pointer is up instead of when the timer is up
    // const up = (event: PointerEvent) => {
    //   if (
    //     pointerId !== undefined &&
    //     event.pointerId !== pointerId
    //   ) {
    //     return;
    //   }

    //   if (timer !== undefined) {
    //     clearTimeout(timer);
    //     timer = undefined;
    //   } else if (pointerId !== undefined) {
    //     binding.value(event);
    //   }

    //   pointerId = undefined;
    // };

    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;

      event.preventDefault();
      event.stopPropagation();

      suppressClick = false;
    };

    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', cancel);
    el.addEventListener('pointerleave', cancel);
    el.addEventListener('pointercancel', cancel);

    el.addEventListener('click', onClick, true);
    el.addEventListener('contextmenu', preventContextMenu, true);

    el.__holdCleanup = () => {
      cancel();

      el.removeEventListener('pointerdown', start);
      el.removeEventListener('pointerup', cancel);
      el.removeEventListener('pointerleave', cancel);
      el.removeEventListener('pointercancel', cancel);
      
      el.removeEventListener('click', onClick, true);
      el.removeEventListener('contextmenu', preventContextMenu, true);
    };
  },

  unmounted(el) {
    el.__holdCleanup?.();
  },
};