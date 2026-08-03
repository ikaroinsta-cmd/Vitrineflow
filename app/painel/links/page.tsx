"use client";

import { useEffect, useState } from "react";

type CustomLink = {
  id: string;
  slug: string;
  originalSlug: string;
  clicks: number;
  createdAt: string;
};

export default function LinksPage() {
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [origin, setOrigin] = useState("");

  async function loadLinks() {
    setLoading(true);
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
    setOrigin(window.location.origin);
  }, []);

  async function handleCreate() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug })
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar link.");
      return;
    }

    setNewSlug("");
    loadLinks();
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Links personalizados</h1>
      <p className="mb-6 text-sm text-slate-500">
        Crie links curtos e personalizados que redirecionam para a sua vitrine, com contagem de
        cliques.
      </p>

      <div className="card mb-6 flex gap-2">
        <div className="flex-1">
          <label className="label">Novo link ({origin}/l/...)</label>
          <input
            className="input"
            placeholder="promo-natal"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
        </div>
        <div className="self-end">
          <button onClick={handleCreate} disabled={saving || !newSlug} className="btn btn-primary">
            {saving ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Cliques</th>
                <th className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-t">
                  <td className="px-4 py-3">
                    <a
                      href={`/l/${link.slug}`}
                      target="_blank"
                      className="text-brand-600 hover:underline"
                    >
                      {origin}/l/{link.slug}
                    </a>
                  </td>
                  <td className="px-4 py-3">{link.clicks}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(link.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
            <p className="p-6 text-center text-slate-500">Nenhum link criado ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
