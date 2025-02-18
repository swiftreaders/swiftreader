import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Work_Sans } from 'next/font/google';
import "../../public/assets/styles/globals.css";

import { AuthProvider } from "@/contexts/authContext"; // Import UserProvider
import { auth0 } from "@/lib/auth0"; // Import Auth0 for session fetching
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Swiftreaders",
  description: "Accelarate your reading speed with Swiftreaders",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession(); // 🔹 Fetch latest session on request

  return (
    <html lang="en"  className={`${workSans.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialSession={session}>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
