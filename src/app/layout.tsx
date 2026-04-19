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
  other: {
    "theme-color": "#1e40af",
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#3b82f6',
    colorBackground: '#1e293b',
    colorInputBackground: '#0f172a',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#cbd5e1',
    colorNeutral: '#64748b',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist-sans)',
    fontSize: '15px',
  },
  elements: {
    card: 'shadow-2xl shadow-black/60 border border-slate-600',
    headerTitle: 'font-bold',
    socialButtonsBlockButton: 'border border-slate-500 hover:border-slate-400 transition-colors',
    formButtonPrimary: 'font-semibold shadow-lg',
    footerActionLink: 'font-semibold',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES} appearance={clerkAppearance}>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
