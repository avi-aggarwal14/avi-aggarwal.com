'use client';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from '@/components/motion-primitives/text-morph';

/** "Copy URL" control; the word morphs to "Copied" for two seconds after a click. */
export function CopyUrlButton() {
  const [label, setLabel] = useState('Copy');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLabel('Copied');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLabel('Copy'), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="absolute top-24 right-4">
      <button type="button" onClick={copy} className="font-base flex items-center gap-1 text-center text-sm text-zinc-500 transition-colors">
        <TextMorph as="p">{label}</TextMorph>
        <span>URL</span>
      </button>
    </div>
  );
}
