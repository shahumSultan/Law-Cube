import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Law Cube — AI-Powered Legal Intake & Marketing Intelligence",
  description:
    "Turn calls into retained clients. Law Cube connects your marketing spend to actual retained clients — so you always know which channels grow your firm.",
  keywords: "law firm software, legal intake, call intelligence, marketing attribution, Clio integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
