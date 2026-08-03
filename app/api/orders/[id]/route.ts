import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validStatuses = ["pendente", "confirmado", "preparando", "enviado", "entregue", "cancelado"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order || order.companyId !== session.user.companyId) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status }
  });

  return NextResponse.json(updated);
}
