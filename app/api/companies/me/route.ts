import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
  return NextResponse.json(company);
}

const allowedFields = [
  "logo",
  "color",
  "whatsapp",
  "email",
  "pixKey",
  "freteRules",
  "aceitaPix",
  "aceitaCartao",
  "aceitaRetirada",
  "aceitaEntrega"
];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key];
  }

  const company = await prisma.company.update({
    where: { id: session.user.companyId },
    data
  });

  return NextResponse.json(company);
}
