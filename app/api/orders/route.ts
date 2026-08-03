import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  companyId: z.string(),
  cliente: z.object({
    nome: z.string().min(2),
    telefone: z.string().min(8),
    endereco: z.string().optional()
  }),
  produtos: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      price: z.number().nonnegative(),
      quantity: z.number().int().positive()
    })
  ),
  subtotal: z.number().nonnegative(),
  frete: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  pagamento: z.string(),
  entrega: z.string()
});

// POST é público: qualquer visitante da vitrine pode criar um pedido (checkout)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: parsed.data.companyId } });
  if (!company || company.status !== "active") {
    return NextResponse.json({ error: "Loja indisponível" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: parsed.data
  });

  await prisma.company.update({
    where: { id: company.id },
    data: { faturamento: { increment: parsed.data.total } }
  });

  return NextResponse.json(order, { status: 201 });
}

// GET é restrito: company_admin vê os pedidos da própria empresa
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let companyId = session.user.companyId;
  if (session.user.role === "super_admin") {
    companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  }

  if (!companyId) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(orders);
}
