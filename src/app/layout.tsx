import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECUnex — Diagnóstico IA para talleres",
  description:
    "Diagnóstico inteligente para talleres mecánicos en España. Obtén causas, pruebas y soluciones por código de fallo OBD con inteligencia artificial.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ECUnex",
  },
  other: {
    "theme-color": "#1e40af",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-touch-icon": "/apple-touch-icon.png",
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#0f172a',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorNeutral: '#64748b',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist-sans)',
  },
  elements: {
    card: 'shadow-2xl shadow-black/40 border-0',
    headerTitle: 'text-slate-900 font-bold text-xl',
    headerSubtitle: 'text-slate-500',
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 font-semibold',
    footerActionLink: 'text-blue-600 font-semibold hover:text-blue-700',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={clerkAppearance}
    >
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
