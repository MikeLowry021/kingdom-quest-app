import type { Metadata } from 'next';
import { Nunito, Crimson_Pro } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

const nunito = Nunito({ 
  subsets: ['latin'], 
  variable: '--font-nunito',
  display: 'swap'
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-crimson-pro',
  display: 'swap'
});

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: {
    template: '%s | KingdomQuest',
    default: 'KingdomQuest - Brand Styling Fixed',
  },
  description: 'KingdomQuest application with complete brand styling implementation - Royal Navy Blue, Gold, Sandstone Beige, and Emerald Green color system with Nunito and Crimson Pro typography.',
};

export default function RootLayout({
  children,
}: Props) {
  return (
    <html className={`${nunito.variable} ${crimsonPro.variable}`} suppressHydrationWarning lang="en">
      <body className={`${nunito.className} antialiased`}>
        {/* Skip link for screen readers */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientProviders>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}