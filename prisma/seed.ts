import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@vitrineflow.com" },
    update: {},
    create: {
      email: "admin@vitrineflow.com",
      password: superAdminPassword,
      role: "super_admin"
    }
  });

  const company = await prisma.company.upsert({
    where: { slug: "loja-exemplo" },
    update: {},
    create: {
      name: "Loja Exemplo",
      slug: "loja-exemplo",
      status: "active",
      plan: "vendas",
      color: "#0EA5E9",
      whatsapp: "5511999999999",
      email: "contato@lojaexemplo.com",
      aceitaPix: true,
      aceitaCartao: true,
      aceitaRetirada: true,
      aceitaEntrega: true,
      freteRules: { tipo: "fixo", valor: 10 }
    }
  });

  const companyAdminPassword = await bcrypt.hash("empresa123", 10);
  await prisma.user.upsert({
    where: { email: "loja@vitrineflow.com" },
    update: {},
    create: {
      email: "loja@vitrineflow.com",
      password: companyAdminPassword,
      role: "company_admin",
      companyId: company.id
    }
  });

  await prisma.product.createMany({
    data: [
      {
        title: "Produto Exemplo 1",
        brand: "Marca A",
        desc: "Descrição do produto exemplo 1",
        hasPrice: true,
        price: 99.9,
        stock: 10,
        companyId: company.id
      },
      {
        title: "Produto Exemplo 2",
        brand: "Marca B",
        desc: "Descrição do produto exemplo 2",
        hasPrice: false,
        stock: 5,
        companyId: company.id
      }
    ]
  });

  console.log("Seed concluído.");
  console.log("Super admin: admin@vitrineflow.com / admin123");
  console.log("Admin da loja: loja@vitrineflow.com / empresa123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
