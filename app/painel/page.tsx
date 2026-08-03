import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PainelDashboard() {
  const session = await getServerSession(authOptions);
  const companyId = session!.user.companyId!;

  const [totalProducts, totalOrders, pendingOrders, company] = await Promise.all([
    prisma.product.count({ where: { companyId } }),
    prisma.order.count({ where: { companyId } }),
    prisma.order.count({ where: { companyId, status: "pendente" } }),
    prisma.company.findUnique({ where: { id: companyId } })
  ]);

  const cards = [
    { label: "Produtos", value: totalProducts },
    { label: "Pedidos totais", value: totalOrders },
    { label: "Pedidos pendentes", value: pendingOrders },
    { label: "Faturamento", value: `R$ ${company?.faturamento.toFixed(2) ?? "0.00"}` }
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-2xl font-bold text-brand-700">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
