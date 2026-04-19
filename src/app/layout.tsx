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
    colorPrimary: '#2563eb',
    colorBackground: '#0f172a',
    colorInputBackground: '#1e293b',
    colorInputText: '#f1f5f9',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorNeutral: '#334155',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist-sans)',
  },
  elements: {
    card: 'bg-slate-900 border border-slate-700/50 shadow-2xl shadow-black/50',
    headerTitle: 'text-white font-bold text-xl',
    headerSubtitle: 'text-slate-400 text-sm',
    socialButtonsBlockButton: 'bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white transition-colors',
    socialButtonsBlockButtonText: 'text-white font-medium',
    dividerLine: 'bg-slate-700',
    dividerText: 'text-slate-500',
    formFieldLabel: 'text-slate-300 text-sm font-medium',
    formFieldInput: 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20',
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-600/25',
    footerActionLink: 'text-blue-400 hover:text-blue-300',
    footerActionText: 'text-slate-400',
    identityPreviewText: 'text-slate-300',
    identityPreviewEditButtonIcon: 'text-blue-400',
    alertText: 'text-slate-300',
    formFieldSuccessText: 'text-green-400',
    formFieldErrorText: 'text-red-400',
    otpCodeFieldInput: 'bg-slate-800 border-slate-600 text-white',
    badge: 'hidden',
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
