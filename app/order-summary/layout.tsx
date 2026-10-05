import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Summary",
};

export default function OrderSummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
