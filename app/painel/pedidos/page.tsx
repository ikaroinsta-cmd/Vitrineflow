"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  number: number;
  cliente: { nome: string; telefone: string; endereco?: string };
  produtos: { title: string; price: number; quantity: number }[];
  subtotal: number;
  frete: number;
  total: number;
  pagamento: string;
  entrega: string;
  status: string;
  createdAt: string;
};

const statusOptions = ["pendente", "confirmado", "preparando", "enviado", "entregue", "cancelado"];

const statusColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700",
  confirmado: "bg-blue-100 text-blue-700",
  preparando: "bg-purple-100 text-purple-700",
  enviado: "bg-cyan-100 text-cyan-700",
  entregue: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700"
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-bold">Pedido #{order.number}</span>{" "}
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <select
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-slate-600">
                <strong>{order.cliente.nome}</strong> · {order.cliente.telefone}
              </p>
              {order.cliente.endereco && (
                <p className="text-sm text-slate-500">{order.cliente.endereco}</p>
              )}

              <ul className="mt-2 space-y-1 text-sm">
                {order.produtos.map((p, i) => (
                  <li key={i}>
                    {p.quantity}x {p.title} — R$ {(p.price * p.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex justify-between text-sm text-slate-500">
                <span>
                  {order.pagamento} · {order.entrega}
                </span>
                <span className="font-bold text-brand-700">Total: R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p className="mt-12 text-center text-slate-500">Nenhum pedido recebido ainda.</p>
      )}
    </div>
  );
}
