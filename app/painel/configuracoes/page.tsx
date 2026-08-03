"use client";

import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  slug: string;
  plan: "vitrine" | "vendas";
  logo: string | null;
  color: string | null;
  whatsapp: string | null;
  email: string | null;
  pixKey: string | null;
  aceitaPix: boolean;
  aceitaCartao: boolean;
  aceitaRetirada: boolean;
  aceitaEntrega: boolean;
  freteRules: { tipo?: string; valor?: number } | null;
};

export default function ConfiguracoesPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/companies/me")
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        setLoading(false);
      });
  }, []);

  async function save(patch: Partial<Company>) {
    if (!company) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/companies/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      const updated = await res.json();
      setCompany(updated);
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading || !company) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Configurações</h1>

      <div className="card mb-4">
        <h2 className="mb-3 font-semibold">Identidade visual</h2>
        <div className="space-y-3">
          <div>
            <label className="label">URL do logo</label>
            <input
              className="input"
              defaultValue={company.logo ?? ""}
              onBlur={(e) => save({ logo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Cor principal</label>
            <input
              type="color"
              className="h-10 w-20"
              defaultValue={company.color ?? "#0EA5E9"}
              onBlur={(e) => save({ color: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="mb-3 font-semibold">Contato</h2>
        <div className="space-y-3">
          <div>
            <label className="label">WhatsApp (com DDI, só números)</label>
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
        <h2 className="mb-3 font-semibold">Pagamento e entrega</h2>
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

        {company.aceitaEntrega && (
          <div className="mt-4 border-t pt-4">
            <label className="label">Valor fixo do frete (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input w-40"
              defaultValue={company.freteRules?.valor ?? 0}
              onBlur={(e) =>
                save({ freteRules: { tipo: "fixo", valor: Number(e.target.value) } })
              }
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Link da vitrine</h2>
        <p className="text-sm text-slate-600">
          {typeof window !== "undefined" && window.location.origin}/loja/{company.slug}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Plano atual: <span className="font-medium capitalize">{company.plan}</span> — para
          mudar de plano, fale com o suporte.
        </p>
      </div>

      {saving && <p className="mt-3 text-sm text-slate-400">Salvando...</p>}
      {saved && !saving && <p className="mt-3 text-sm text-emerald-600">Salvo.</p>}
    </div>
  );
}
