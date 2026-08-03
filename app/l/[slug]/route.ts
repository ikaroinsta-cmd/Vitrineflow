import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const link = await prisma.customLink.findUnique({ where: { slug: params.slug } });

  if (!link) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await prisma.customLink.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } }
  });

  return NextResponse.redirect(new URL(`/loja/${link.originalSlug}`, req.url));
}
