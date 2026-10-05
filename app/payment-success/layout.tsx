import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Success",
};

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
