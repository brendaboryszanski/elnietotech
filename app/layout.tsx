import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "El Nieto Tech - Ayuda con Tecnología",
  description:
    "Tu asistente personal para resolver problemas de tecnología. Simple, amable y en argentino.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤗</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className={`${nunito.className} min-h-screen`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
