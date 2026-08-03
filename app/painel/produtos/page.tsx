"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  brand: string | null;
  desc: string | null;
  imageUrl: string | null;
  hasPrice: boolean;
  price: number | null;
  stock: number;
};

const emptyForm = {
  title: "",
  brand: "",
  desc: "",
  imageUrl: "",
  hasPrice: true,
  price: "",
  stock: "0"
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(product: Product) {
    setForm({
      title: product.title,
      brand: product.brand ?? "",
      desc: product.desc ?? "",
      imageUrl: product.imageUrl ?? "",
      hasPrice: product.hasPrice,
      price: product.price?.toString() ?? "",
      stock: product.stock.toString()
    });
    setEditingId(product.id);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    const payload = {
      title: form.title,
      brand: form.brand || undefined,
      desc: form.desc || undefined,
      imageUrl: form.imageUrl || undefined,
      hasPrice: form.hasPrice,
      price: form.hasPrice && form.price ? Number(form.price) : null,
      stock: Number(form.stock) || 0
    };

    const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);

    if (!res.ok) {
      setError("Erro ao salvar produto. Verifique os campos.");
      return;
    }

    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button onClick={openNew} className="btn btn-primary">
          + Novo produto
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">Sem imagem</span>
                )}
              </div>
              <h3 className="text-sm font-semibold">{product.title}</h3>
              <p className="text-xs text-slate-500">Estoque: {product.stock}</p>
              {product.hasPrice ? (
                <p className="font-bold text-brand-700">R$ {product.price?.toFixed(2)}</p>
              ) : (
                <p className="text-xs text-slate-500">Sob consulta</p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(product)} className="btn btn-secondary flex-1 text-xs">
                  Editar
                </button>
                <button onClick={() => handleDelete(product.id)} className="btn btn-danger flex-1 text-xs">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="mt-12 text-center text-slate-500">Nenhum produto cadastrado ainda.</p>
      )}

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">{editingId ? "Editar produto" : "Novo produto"}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Título</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Marca</label>
                <input
                  className="input"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              <div>
                <label className="label">URL da imagem</label>
                <input
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.hasPrice}
                  onChange={(e) => setForm({ ...form, hasPrice: e.target.checked })}
                />
                Exibir preço (desmarque para "sob consulta")
              </label>
              {form.hasPrice && (
                <div>
                  <label className="label">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="label">Estoque</label>
                <input
                  type="number"
                  className="input"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
