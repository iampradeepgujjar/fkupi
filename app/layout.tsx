import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online shoping",
  description: "Online shoping",
  openGraph: {
    title: "Online shoping",
    description: "Online shoping",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
