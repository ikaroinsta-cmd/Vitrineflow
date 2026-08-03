   export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalCompanies, activeCompanies, totalOrders, totalProducts] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "active" } }),
    prisma.order.count(),
    prisma.product.count()
  ]);

  const cards = [
    { label: "Empresas", value: totalCompanies },
    { label: "Empresas ativas", value: activeCompanies },
    { label: "Pedidos totais", value: totalOrders },
    { label: "Produtos cadastrados", value: totalProducts }
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-brand-700">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
