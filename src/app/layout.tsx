import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RedKolors | Moda Exclusiva para la Mujer Moderna",
  description: "Descubre la nueva colección 2026 de RedKolors. Ropa exclusiva, tres sucursales y envíos a todo México.",
  keywords: ["moda femenina", "ropa mujer", "redkolors", "los reyes la paz", "nezahualcoyotl", "boutique", "estilo"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className="antialiased bg-[#020617] text-slate-200 min-h-screen flex flex-col selection:bg-rose-500/30 selection:text-rose-200"
      >
        <Navbar />
        <CartSidebar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
