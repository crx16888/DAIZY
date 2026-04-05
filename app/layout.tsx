import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daizy Waves",
  description: "A Next.js landing page built from the Big Sur blue waves study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
