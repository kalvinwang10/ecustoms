'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initMixpanel, identifyUser, trackPageView } from '@/lib/mixpanel';

interface MixpanelProviderProps {
  children: React.ReactNode;
}

export default function MixpanelProvider({ children }: MixpanelProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Mixpanel on component mount
    initMixpanel();
    
    // Small delay to ensure initialization is complete
    setTimeout(() => {
      identifyUser();
    }, 100);
  }, []);

  useEffect(() => {
    // Track page view on route change with small delay
    setTimeout(() => {
      const getPageName = (path: string) => {
        switch (path) {
          case '/':
            return 'Home';
          case '/start':
            return 'Start';
          case '/form':
            return 'Form';
          case '/info':
            return 'Info';
          default:
            return path.replace('/', '') || 'Unknown';
        }
      };

      const pageName = getPageName(pathname);
      trackPageView(pageName, {
        path: pathname,
      });
    }, 200);
  }, [pathname]);

  return <>{children}</>;
}