import type { Metadata, Viewport } from "next";
import { Zen_Old_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// Mincho carries the display voice and the vertical kanji; Kaku Gothic carries reading text
const mincho = Zen_Old_Mincho({
  variable: "--nf-mincho",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const gothic = Zen_Kaku_Gothic_New({
  variable: "--nf-gothic",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "The Way of the Samurai — Tanjo, Vol. 1",
  description:
    "A continuous cinematic scroll film exploring honour, discipline, strength, silence, and precision through the art of the blade.",
  keywords: ["Samurai", "Katana", "Cinematic Experience", "The Jade Samurai", "Tanjo", "Bushido"],
};

// cover: lets bottom-anchored copy read env(safe-area-inset-bottom) on notched phones
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0b0a09" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mincho.variable} ${gothic.variable} dark`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
