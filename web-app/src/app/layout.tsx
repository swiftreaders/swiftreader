import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "../../public/styles/globals.css";
import "../../public/styles/fonts.css";

import { AuthProvider } from "@/contexts/authContext"; // Import UserProvider
import { auth0 } from "@/lib/auth0"; // Import Auth0 for session fetching

import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"], // Regular and Bold
  variable: "--font-atkinson", // Define a CSS variable
  display: "swap",
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
  const session = await auth0.getSession(); // Fetch latest session on request

  return (
    <html lang="en" className={`${atkinson.variable} text-text`}>
      <body>
        <ThemeProvider attribute="class">
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
