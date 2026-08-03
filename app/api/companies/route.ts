import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  plan: z.enum(["vitrine", "vendas"]).default("vitrine"),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  color: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6)
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "super_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, orders: true } } }
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "super_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = companySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { adminEmail, adminPassword, ...companyData } = parsed.data;

  const existingSlug = await prisma.company.findUnique({ where: { slug: companyData.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Esse slug já está em uso." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "Esse e-mail de admin já está em uso." }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      ...companyData,
      email: companyData.email || null
    }
  });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "company_admin",
      companyId: company.id
    }
  });

  return NextResponse.json(company, { status: 201 });
}
