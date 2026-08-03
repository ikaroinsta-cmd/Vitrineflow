"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "blocked";
  plan: "vitrine" | "vendas";
  whatsapp: string | null;
  email: string | null;
  pixKey: string | null;
  faturamento: number;
  aceitaPix: boolean;
  aceitaCartao: boolean;
  aceitaRetirada: boolean;
  aceitaEntrega: boolean;
};

export default function EmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        setLoading(false);
      });
  }, [params.id]);

  async function save(patch: Partial<Company>) {
    if (!company) return;
    setSaving(true);
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      const updated = await res.json();
      setCompany(updated);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!company) return;
    if (!confirm(`Excluir a empresa "${company.name}"? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
    router.push("/admin/empresas");
  }

  if (loading || !company) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">{company.name}</h1>
      <p className="mb-6 text-slate-500">/{company.slug}</p>

      <div className="card mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label mb-0">Status</span>
          <button
            onClick={() => save({ status: company.status === "active" ? "blocked" : "active" })}
            disabled={saving}
            className={company.status === "active" ? "btn btn-danger" : "btn btn-primary"}
          >
            {company.status === "active" ? "Bloquear empresa" : "Reativar empresa"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="label mb-0">Plano</span>
          <select
            className="input w-40"
            value={company.plan}
            onChange={(e) => save({ plan: e.target.value })}
          >
            <option value="vitrine">Vitrine</option>
            <option value="vendas">Vendas</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="label mb-0">Faturamento total</span>
          <span className="font-bold text-brand-700">R$ {company.faturamento.toFixed(2)}</span>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="mb-3 font-semibold">Contato</h2>
        <div className="space-y-3">
          <div>
            <label className="label">WhatsApp</label>
            <input
              className="input"
              defaultValue={company.whatsapp ?? ""}
              onBlur={(e) => save({ whatsapp: e.target.value })}
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              defaultValue={company.email ?? ""}
              onBlur={(e) => save({ email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Chave Pix</label>
            <input
              className="input"
              defaultValue={company.pixKey ?? ""}
              onBlur={(e) => save({ pixKey: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="mb-3 font-semibold">Formas de pagamento e entrega</h2>
        <div className="space-y-2 text-sm">
          {[
            { key: "aceitaPix", label: "Aceita Pix" },
            { key: "aceitaCartao", label: "Aceita Cartão" },
            { key: "aceitaRetirada", label: "Aceita Retirada" },
            { key: "aceitaEntrega", label: "Aceita Entrega" }
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(company as any)[item.key]}
                onChange={(e) => save({ [item.key]: e.target.checked } as Partial<Company>)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleDelete} className="btn btn-danger">
        Excluir empresa
      </button>
    </div>
  );
}
