"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "blocked";
  plan: "vitrine" | "vendas";
  faturamento: number;
  _count: { products: number; orders: number };
};

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    plan: "vitrine",
    whatsapp: "",
    email: "",
    adminEmail: "",
    adminPassword: ""
  });

  async function loadCompanies() {
    setLoading(true);
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleCreate() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar empresa.");
      return;
    }

    setShowForm(false);
    setForm({ name: "", slug: "", plan: "vitrine", whatsapp: "", email: "", adminEmail: "", adminPassword: "" });
    loadCompanies();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Nova empresa
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Produtos</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">/{c.slug}</td>
                  <td className="px-4 py-3 capitalize">{c.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        c.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status === "active" ? "Ativa" : "Bloqueada"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c._count.products}</td>
                  <td className="px-4 py-3">{c._count.orders}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/empresas/${c.id}`} className="text-brand-600 hover:underline">
                      Gerenciar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {companies.length === 0 && (
            <p className="p-6 text-center text-slate-500">Nenhuma empresa cadastrada.</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Nova empresa</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nome</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Slug (vitrine.com/loja/slug)</label>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Plano</label>
                <select
                  className="input"
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                >
                  <option value="vitrine">Vitrine (sem carrinho)</option>
                  <option value="vendas">Vendas (com carrinho)</option>
                </select>
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input
                  className="input"
                  placeholder="5511999999999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <label className="label">E-mail da empresa</label>
                <input
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <hr />
              <div>
                <label className="label">E-mail do admin da empresa</label>
                <input
                  className="input"
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Senha do admin da empresa</label>
                <input
                  type="password"
                  className="input"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={handleCreate} disabled={saving} className="btn btn-primary flex-1">
                  {saving ? "Salvando..." : "Criar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
