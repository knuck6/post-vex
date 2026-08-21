'use client';

import { type ReactNode } from 'react';
import {
  ConsentManagerProvider,
  ConsentBanner,
  ConsentDialog,
} from '@c15t/nextjs';

export default function ConsentManagerClient({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        // backendURL: 'https://your-instance.c15t.dev',
        consentCategories: ['necessary', 'measurement', 'marketing'],
        // Shows banner during development. Remove for production.
        overrides: { country: 'ro' },
        i18n:{
            locale:'ro',
            messages:{
                ro: {
                    cookieBanner:{
                        title:"Punem pret pe 'private' tau",
                        description:"Folosim cookies pentru imbunatatirea si masurarea performantei site-ului"
                    },
                    common:{
                      acceptAll:"Accept cookies",
                      rejectAll:"Resping tot",
                      customize:"Aleg ce vreau"
                    }
                }
            }
        }
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  );
}