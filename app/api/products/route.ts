import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(2),
  brand: z.string().optional(),
  desc: z.string().optional(),
  imageUrl: z.string().optional(),
  hasPrice: z.boolean().default(true),
  price: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0)
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let companyId = session.user.companyId;

  if (session.user.role === "super_admin") {
    companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  }

  if (!companyId) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      companyId: session.user.companyId
    }
  });

  return NextResponse.json(product, { status: 201 });
}
