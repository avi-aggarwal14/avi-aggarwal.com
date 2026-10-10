'use client';
// motion-primitives AnimatedBackground (unchanged behaviour; typed children, lint-clean).
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { Children, cloneElement, useEffect, useId, useState, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

type ChildProps = {
  'data-id': string;
  className?: string;
  children?: React.ReactNode;
};

export type AnimatedBackgroundProps = {
  children: ReactElement<ChildProps>[] | ReactElement<ChildProps>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  useEffect(() => {
    // Follow a changed `defaultValue` prop (third-party primitive behaviour).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (defaultValue !== undefined) setActiveId(defaultValue);
  }, [defaultValue]);

  return Children.map(children, (child: ReactElement<ChildProps>, index) => {
    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? { onMouseEnter: () => handleSetActiveId(id), onMouseLeave: () => handleSetActiveId(null) }
      : { onClick: () => handleSetActiveId(id) };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      } as Partial<ChildProps> & Record<string, unknown>,
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{child.props.children}</div>
      </>,
    );
  });
}
