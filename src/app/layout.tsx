import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enviable Transport - Book Bus Tickets Online",
  description:
    "Book affordable and comfortable bus trips across Nigeria with Enviable Transport.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('error',function(e){if(e.message&&(e.message.includes('ChunkLoadError')||e.message.includes('Loading chunk')||e.message.includes('Failed to fetch dynamically imported module'))){window.location.reload();}});`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
