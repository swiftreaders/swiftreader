import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "../../public/styles/globals.css";
import "../../public/styles/fonts.css";

import { AuthProvider } from "@/contexts/authContext";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

// Define metadata correctly
export const metadata: Metadata = {
  title: "Swiftreaders",
  description: "Accelerate your reading speed with Swiftreaders",
  icons: {
    icon: "/assets/icons/favicon.ico", // Use static path, no import needed
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
