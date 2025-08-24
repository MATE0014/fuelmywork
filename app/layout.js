import { Raleway, Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { ClientProviders } from "@/components/client-providers"
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100","200","300", "400","500","600", "700"],
  variable: "--font-raleway",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});


export const metadata = {
  title: "Fuel My Work",
  description: "Support your favorite open source projects",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} ${outfit.variable} antialiased`}
      >
        <ClientProviders>
            <Navbar />
            <Toaster position="top-right" richColors closeButton theme="dark" />
            {children}
            <Footer />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
