import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();
const previewImageUrl = `${siteUrl}/robokorda-logo.png`;

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
      { url: "/robokorda-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/robokorda-logo.png", type: "image/png" }],
    shortcut: ["/robokorda-logo.png"],
  },
  openGraph: {
    title: "Robokorda 10th Anniversary Invitations",
    description: "Private invitation and RSVP platform for Robokorda's 10th Anniversary at Manna Safari Lodge.",
    siteName: "Robokorda Africa",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: previewImageUrl,
        width: 512,
        height: 512,
        alt: "Robokorda Africa logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Robokorda 10th Anniversary Invitations",
    description: "Private invitation and RSVP platform for Robokorda's 10th Anniversary at Manna Safari Lodge.",
    images: [previewImageUrl],
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
