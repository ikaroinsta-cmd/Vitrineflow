import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const linkSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen")
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const links = await prisma.customLink.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "company_admin" || !session.user.companyId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.customLink.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Esse link já está em uso." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
  if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  const link = await prisma.customLink.create({
    data: {
      slug: parsed.data.slug,
      originalSlug: company.slug,
      companyId: company.id
    }
  });

  return NextResponse.json(link, { status: 201 });
}
