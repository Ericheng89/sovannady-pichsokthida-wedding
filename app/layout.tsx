
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

const siteUrl =
  "https://sovannady-pichsokthida-wedding.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
    alternates: {
    canonical: siteUrl,
  },

  title: "Sovannady & Pichsokthida | Wedding Invitation",

  description:
    "You're warmly invited to celebrate the wedding of Sovannady and Pichsokthida on 16 November 2026 at Lucky Bright Restaurant, Phnom Penh.",

  openGraph: {
    title: "Sovannady & Pichsokthida | Wedding Invitation",

    description:
      "16 November 2026 | 5:00 PM | Lucky Bright Restaurant, Phnom Penh. We look forward to celebrating with you!",

    url: siteUrl,

    siteName: "Sovannady & Pichsokthida Wedding",

    locale: "en_US",

    type: "website",

    images: [
      {
        url: "/wedding-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Sovannady and Pichsokthida Wedding Invitation",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Sovannady & Pichsokthida | Wedding Invitation",

    description:
      "Join us on 16 November 2026 at Lucky Bright Restaurant, Phnom Penh.",

    images: ["/wedding-preview.jpg"],
  },

  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
