'use client';
import { useEffect } from 'react';
import { CONTENT_OVERLAY_HIDE, CONTENT_OVERLAY_SHOW, CUSTOM_CURSOR_ENABLE, dispatch } from '@/lib/events';

/** Module-level reference count so nested popups do not unlock the page early. */
let openCount = 0;

/**
 * Shared by every popup/dialog and the command bar.
 * 0→1: add `body.popup-open` + `content-overlay-hide`.
 * 1→0: remove it + `content-overlay-show` + `custom-cursor-enable`.
 */
export function usePopupOverlay(open: boolean) {
  useEffect(() => {
    if (!open) return;
    if (++openCount === 1) {
      document.body.classList.add('popup-open');
      dispatch(CONTENT_OVERLAY_HIDE);
    }
    return () => {
      if (--openCount === 0) {
        document.body.classList.remove('popup-open');
        dispatch(CONTENT_OVERLAY_SHOW);
        dispatch(CUSTOM_CURSOR_ENABLE);
      }
    };
  }, [open]);
}
