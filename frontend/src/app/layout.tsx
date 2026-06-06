import type { Metadata } from "next";
import { Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Law Cube — AI Intake & Marketing Intelligence for Law Firms",
  description:
    "Know exactly which campaigns retain clients. Law Cube connects every marketing dollar to retained clients with AI-powered call intelligence, lead scoring, and attribution.",
  keywords: "law firm software, legal intake, call intelligence, marketing attribution, AI lead scoring, Clio integration",
};

// Theme-flash prevention script — inlined as a string so it can be passed
// to dangerouslySetInnerHTML in a Server Component. React 19 emits a dev
// warning for <script> tags in RSC, but the script IS executed by the browser
// because this component is server-rendered; React's client reconciler skips it.
const themeScript = `(function(){try{var t=localStorage.getItem('lc-theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${oswald.variable} h-full`} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Runs synchronously before first paint to avoid dark-mode flash.
            React 19 warns about <script> in RSC but this is intentional SSR. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
