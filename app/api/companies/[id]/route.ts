import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "super_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "super_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();

  const allowedFields = [
    "name",
    "customSlug",
    "status",
    "plan",
    "logo",
    "color",
    "whatsapp",
    "email",
    "pixKey",
    "freteRules",
    "aceitaPix",
    "aceitaCartao",
    "aceitaRetirada",
    "aceitaEntrega",
    "faturamento"
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key];
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data
  });

  return NextResponse.json(company);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "super_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
