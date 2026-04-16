import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono } from 'next/font/google';

import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Hatjitsu',
  description: 'Realtime planning poker rebuilt for Vercel-native collaboration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
