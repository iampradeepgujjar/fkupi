import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Address",
};

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
