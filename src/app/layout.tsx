import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRConnect – QR Codes para WhatsApp + n8n",
  description:
    "Crea y gestiona QR codes escaneables que conectan WhatsApp con tus automatizaciones de n8n.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
