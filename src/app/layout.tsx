import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const APP_NAME = "Lillenaam";
const APP_DESCRIPTION =
  "Help us choose a name for our baby girl! Browse officially approved Danish names with Indic origins and pick your top 5, including your #1 favorite.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${APP_NAME} — Baby Names Voting`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — Baby Names Voting`,
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Baby Names Voting`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Baby Names Voting`,
    description: APP_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
