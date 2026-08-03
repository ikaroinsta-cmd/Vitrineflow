"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

type Company = {
  id: string;
  name: string;
  logo: string | null;
  color: string | null;
  whatsapp: string | null;
  plan: "vitrine" | "vendas";
  aceitaPix: boolean;
  aceitaCartao: boolean;
  aceitaRetirada: boolean;
  aceitaEntrega: boolean;
  freteRules: any;
};

type CartItem = { product: Product; quantity: number };

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardFadeInUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Storefront({ company, products }: { company: Company; products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [entrega, setEntrega] = useState(company.aceitaRetirada ? "retirada" : "entrega");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cartBump, setCartBump] = useState(0);
  const color = company.color || "#0EA5E9";

  const isVendas = company.plan === "vendas";

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0),
    [cart]
  );

  const frete = entrega === "entrega" && company.freteRules?.tipo === "fixo"
    ? Number(company.freteRules?.valor || 0)
    : 0;

  const total = subtotal + frete;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartBump((n) => n + 1);
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  }

  function whatsappLink(product?: Product) {
    if (!company.whatsapp) return "#";
    const text = product
      ? `Olá! Tenho interesse no produto: ${product.title}`
      : "Olá! Vim pela vitrine online.";
    return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  async function handleCheckout() {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          cliente: { nome, telefone, endereco },
          produtos: cart.map((i) => ({
            productId: i.product.id,
            title: i.product.title,
            price: i.product.price || 0,
            quantity: i.quantity
          })),
          subtotal,
          frete,
          total,
          pagamento,
          entrega
        })
      });

      if (res.ok) {
        setSuccess(true);
        setCart([]);
      }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-28">
      {/* Fundo com orbs desfocados pulsando */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: color, opacity: 0.25 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-6rem] top-40 h-96 w-96 rounded-full bg-fuchsia-300 blur-3xl"
          style={{ opacity: 0.2 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-amber-200 blur-3xl"
          style={{ opacity: 0.2 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Header / Hero com float */}
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 px-4 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                width={56}
                height={56}
                className="rounded-full object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
                style={{ backgroundColor: color }}
              >
                {company.name.charAt(0)}
              </div>
            )}
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold tracking-tight"
            >
              {company.name}
            </motion.h1>
            {company.whatsapp && (
              <motion.a
                href={whatsappLink()}
                target="_blank"
                className="text-sm text-emerald-600 hover:underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Falar no WhatsApp
              </motion.a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={cardFadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/60 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md"
            >
              <div className="mb-3 h-32 overflow-hidden rounded-[20px] bg-slate-100">
                {product.imageUrl ? (
                  <motion.div
                    className="h-full w-full"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      width={200}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs text-slate-400">Sem imagem</span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold">{product.title}</h3>
              {product.brand && <p className="text-xs text-slate-500">{product.brand}</p>}
              {product.desc && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.desc}</p>}

              <div className="mt-3 flex-1" />

              {product.hasPrice && product.price != null ? (
                <p className="mb-2 font-bold" style={{ color }}>
                  R$ {product.price.toFixed(2)}
                </p>
              ) : (
                <p className="mb-2 text-sm text-slate-500">Consulte o preço</p>
              )}

              {isVendas && product.hasPrice ? (
                <motion.button
                  onClick={() => addToCart(product)}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.03 }}
                  className="btn btn-primary rounded-2xl text-xs"
                >
                  Adicionar
                </motion.button>
              ) : (
                <motion.a
                  href={whatsappLink(product)}
                  target="_blank"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.03 }}
                  className="btn btn-secondary rounded-2xl text-xs"
                >
                  Consultar
                </motion.a>
              )}
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && (
          <p className="mt-12 text-center text-slate-500">Nenhum produto cadastrado ainda.</p>
        )}
      </main>

      {/* Botão flutuante do WhatsApp com pulse infinito */}
      {company.whatsapp && (
        <motion.a
          href={whatsappLink()}
          target="_blank"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <svg viewBox="0 0 32 32" className="relative z-10 h-7 w-7 fill-white">
            <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.418L4 29l7.77-1.83A11.94 11.94 0 0 0 16 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3zm0 21.7c-1.94 0-3.75-.54-5.29-1.48l-.38-.23-4.61 1.09 1.12-4.49-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16.001 24.7zm5.86-8.03c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.72-1.73-.98-2.36-.26-.63-.53-.54-.72-.55h-.62c-.21 0-.55.08-.83.4-.29.32-1.1 1.07-1.1 2.62s1.12 3.04 1.28 3.25c.16.21 2.2 3.36 5.33 4.71.75.32 1.33.51 1.78.66.75.24 1.43.2 1.97.13.6-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z"/>
          </svg>
        </motion.a>
      )}

      {/* Barra flutuante do carrinho, com bounce ao adicionar item */}
      <AnimatePresence>
        {isVendas && cart.length > 0 && !showCheckout && (
          <motion.div
            key="cart-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/40 bg-white/70 p-4 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <motion.span
                key={cartBump}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, bounce: 0.6 }}
                className="text-sm font-medium"
              >
                {totalItems} item(s) · R$ {subtotal.toFixed(2)}
              </motion.span>
              <motion.button
                onClick={() => setShowCheckout(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary rounded-2xl"
                style={{ backgroundColor: color }}
              >
                Finalizar pedido
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de checkout */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:rounded-[28px]"
            >
              {success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="py-6 text-center"
                >
                  <p className="mb-4 text-lg font-semibold text-emerald-600">
                    Pedido enviado com sucesso!
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setShowCheckout(false);
                    }}
                    className="btn btn-primary rounded-2xl"
                  >
                    Fechar
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="mb-4 text-lg font-bold">Finalizar pedido</h2>

                  <div className="mb-4 space-y-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between text-sm">
                        <span>{item.product.title}</span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-6 w-6 rounded-full bg-slate-200"
                          >
                            -
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.6 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 rounded-full bg-slate-200"
                          >
                            +
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Nome</label>
                      <input className="input rounded-xl" value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Telefone</label>
                      <input
                        className="input rounded-xl"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                    </div>

                    {(company.aceitaEntrega || company.aceitaRetirada) && (
                      <div>
                        <label className="label">Entrega</label>
                        <select
                          className="input rounded-xl"
                          value={entrega}
                          onChange={(e) => setEntrega(e.target.value)}
                        >
                          {company.aceitaRetirada && <option value="retirada">Retirada no local</option>}
                          {company.aceitaEntrega && <option value="entrega">Entrega</option>}
                        </select>
                      </div>
                    )}

                    {entrega === "entrega" && (
                      <div>
                        <label className="label">Endereço</label>
                        <input
                          className="input rounded-xl"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="label">Pagamento</label>
                      <select
                        className="input rounded-xl"
                        value={pagamento}
                        onChange={(e) => setPagamento(e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {company.aceitaPix && <option value="pix">Pix</option>}
                        {company.aceitaCartao && <option value="cartao">Cartão</option>}
                        <option value="dinheiro">Dinheiro</option>
                      </select>
                    </div>

                    <div className="border-t pt-3 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span>R$ {frete.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowCheckout(false)}
                        className="btn btn-secondary flex-1 rounded-2xl"
                      >
                        Voltar
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleCheckout}
                        disabled={!nome || !telefone || !pagamento || placing}
                        className="btn btn-primary flex-1 rounded-2xl"
                      >
                        {placing ? "Enviando..." : "Confirmar"}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
