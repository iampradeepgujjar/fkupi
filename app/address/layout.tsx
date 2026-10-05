import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Address",
};

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        html, body {
          height: 100% !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      {children}
    </div>
  );
}
