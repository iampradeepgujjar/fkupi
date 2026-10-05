import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Page",
};

export default function PaymentPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
