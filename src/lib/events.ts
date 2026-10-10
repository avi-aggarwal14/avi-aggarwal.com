/** Custom window events shared across the site (names are part of the observed contract). */
export const CONTENT_OVERLAY_HIDE = 'content-overlay-hide';
export const CONTENT_OVERLAY_SHOW = 'content-overlay-show';
export const CUSTOM_CURSOR_DISABLE = 'custom-cursor-disable';
export const CUSTOM_CURSOR_ENABLE = 'custom-cursor-enable';
export const CUSTOM_CURSOR_RESET = 'custom-cursor-reset';
export const EXPAND_FOR_ELEMENT = 'expand-for-element';
export const CLOSE_ALL_POPUPS = 'close-all-popups';
export const OPEN_STATS_DIALOG = 'open-stats-dialog';

export function dispatch(name: string) {
  window.dispatchEvent(new Event(name));
}
