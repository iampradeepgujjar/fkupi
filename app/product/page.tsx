import type { Metadata } from "next";
import { Suspense } from "react";
import productsData from "../../data/products.json";
import ProductClient from "./ProductClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const id = typeof resolvedSearchParams?.id === "string" ? resolvedSearchParams.id : undefined;
  const product = productsData.find((p) => p.id === id) || productsData[0];
  const title = product?.title || "Product";

  return {
    title,
    description: title,
    openGraph: {
      title,
      description: title,
      images: product?.image ? [{ url: product.image }] : [],
    },
  };
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div
          className="store-shell"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Loading...
        </div>
      }
    >
      <ProductClient />
    </Suspense>
  );
}