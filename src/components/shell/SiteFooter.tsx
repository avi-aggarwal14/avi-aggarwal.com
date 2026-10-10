'use client';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/shell/Footer';

/** Layout-level footer for every route except `/`, where the homepage renders `Footer` itself. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <Footer />;
}
