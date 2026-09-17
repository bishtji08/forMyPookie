import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://my-pookie-three.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'For My Pookie ❤️ — A Love Letter Just For You',
  description: 'A private romantic apology and love-story platform. Make her smile first.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'For My Pookie ❤️',
    description: 'A tiny interactive love letter from me to my pookie.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
