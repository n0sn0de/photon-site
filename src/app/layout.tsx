import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ChainStatusBar } from "@/components/chain-status-bar";
import { ClientProviders } from "@/components/providers/client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHOTON — The Fee Token of AtomOne",
  description:
    "Explore Photon, the dedicated fee token of the AtomOne blockchain. Live chain data, mint vs buy arbitrage, conversion rate simulator, and the dual-token model explained.",
  openGraph: {
    title: "PHOTON — The Fee Token of AtomOne",
    description:
      "Live chain data, mint vs buy arbitrage indicator, conversion rate simulator, and deep dives into AtomOne's dual-token architecture.",
    type: "website",
  },
  icons: {
    icon: "/assets/photon.svg",
    apple: "/assets/photon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          <div className="grain" />
          <Nav />
          <main className="pt-14 pb-12">{children}</main>
          <Footer />
          <ChainStatusBar />
        </ClientProviders>
      </body>
    </html>
  );
}
