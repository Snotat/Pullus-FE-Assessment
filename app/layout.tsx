import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import NetworkChecker from "@/components/NetworkChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

if (typeof window !== 'undefined') {
  console.log(
    "%c Built by Shuaib Nurudeen Olawale %c https://snotat.netlify.app for pullus-africa frontend dev assessment",
    "color: white; background: #10b981; padding: 5px 10px; border-radius: 5px; font-weight: bold;",
    "color: #10b981; text-decoration: underline;"
  );
}
export const metadata: Metadata = {
  
  title: "Pullus Notebook",
  description: "Frontend Development Assessment",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Next App",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
    
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/icon-32x32.png',
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="bg-white">
     
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NetworkChecker />
         <NavBar />
        {children}
      </body>
    </html>
  );
}
