import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "RV — Ecosistema de Gestión y Control de Riesgos Deportivos",
  description: "La plataforma de software integral para clubes y organizadores de resistencia. Controla membresías, automatiza cobros y mitiga riesgos legales mediante la validación inteligente de aptos médicos.",
  keywords: ["gestión deportiva", "clubes de corredores", "trail running", "apto médico", "acreditación offline", "carreras de montaña"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-accent/30 selection:text-accent-foreground dark">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
