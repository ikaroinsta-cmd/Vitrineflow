import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(productId: string, companyId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  return product && product.companyId === companyId ? product : null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  if (session.user.role === "company_admin" && product.companyId !== session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const owned = await assertOwnership(params.id, session.user.companyId);
  if (!owned) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  const body = await req.json();
  const allowedFields = ["title", "brand", "desc", "imageUrl", "hasPrice", "price", "stock"];
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key];
  }

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const owned = await assertOwnership(params.id, session.user.companyId);
  if (!owned) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
