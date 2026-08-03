import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Storefront from "@/components/Storefront";

export default async function LojaPage({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug }
  });

  if (!company || company.status !== "active") {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" }
  });

  return <Storefront company={company} products={products} />;
}
