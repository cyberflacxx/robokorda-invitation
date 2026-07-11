import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

const configuredBaseUrl = process.env.INVITATION_PUBLIC_URL?.trim();
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const siteUrl = configuredBaseUrl
  ?? (productionUrl ? (productionUrl.startsWith("http") ? productionUrl : `https://${productionUrl}`) : "https://robokorda-invitation.vercel.app");

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Robokorda 10th Anniversary Invitations",
  description: "Private invitation and RSVP platform for Robokorda's 10th Anniversary at Manna Safari Lodge.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Robokorda 10th Anniversary Invitations",
    description: "Private invitation and RSVP platform for Robokorda's 10th Anniversary at Manna Safari Lodge.",
    siteName: "Robokorda Africa",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 226,
        height: 223,
        alt: "Robokorda Africa logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Robokorda 10th Anniversary Invitations",
    description: "Private invitation and RSVP platform for Robokorda's 10th Anniversary at Manna Safari Lodge.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${playfairDisplay.variable} min-h-screen bg-brand-ink text-brand-paper antialiased transition-colors`}
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
