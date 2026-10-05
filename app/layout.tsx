import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online shopping",
  description: "Online shopping",
  openGraph: {
    title: "Online shopping",
    description: "Online shopping",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QVNDBCKKHE" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-QVNDBCKKHE');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
