import { assertUnreachable } from '@/lib/assert';
import { EXPAND_FOR_ELEMENT } from '@/lib/events';

export type ScrollBlock = 'start' | 'center' | 'end' | 'nearest';

export type ScrollToElementOptions = {
  block?: ScrollBlock; // default 'center'
  highlight?: boolean; // default false
  offset?: number; // default 0
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Polls on rAF until the element sits at its intended offset, or the page has stopped moving. */
function waitForScrollSettle(el: HTMLElement, block: ScrollBlock, offset: number): Promise<void> {
  return new Promise((resolve) => {
    let lastScrollY = window.scrollY;
    let stillFrames = 0;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const y = window.scrollY;

      let targetTop: number;
      if (offset !== 0) {
        targetTop = offset;
      } else {
        switch (block) {
          case 'start':
            targetTop = 0;
            break;
          case 'end':
            targetTop = vh - rect.height;
            break;
          case 'center':
            targetTop = (vh - rect.height) / 2;
            break;
          case 'nearest':
            targetTop = rect.top;
            break;
          default:
            return assertUnreachable(block);
        }
      }

      const distance = Math.abs(rect.top - targetTop);
      if (Math.abs(y - lastScrollY) < 1) stillFrames++;
      else {
        stillFrames = 0;
        lastScrollY = y;
      }

      if (distance < 5 || stillFrames > 3) resolve();
      else requestAnimationFrame(tick);
    };

    setTimeout(() => requestAnimationFrame(tick), 100);
  });
}

/**
 * The site's single navigation primitive: expand any collapsed list containing the id, scroll,
 * wait until the scroll settled, then (optionally) flash the `.highlight-animation` overlay.
 */
export async function scrollToElement(id: string, options: ScrollToElementOptions = {}): Promise<void> {
  const { block = 'center', highlight = false, offset = 0 } = options;

  window.dispatchEvent(new CustomEvent(EXPAND_FOR_ELEMENT, { detail: { elementId: id } }));
  await sleep(0);

  const el = document.getElementById(id);
  if (!el) return;

  if (offset !== 0) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - offset, behavior: 'smooth' });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block });
  }

  if (highlight) {
    await waitForScrollSettle(el, block, offset);
    await sleep(250);
    el.classList.add('highlight-animation');
    el.addEventListener('animationend', () => el.classList.remove('highlight-animation'), { once: true });
  }
}
