"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "E-mail ou senha inválidos." : res.error);
      return;
    }

    const meRes = await fetch("/api/auth/session");
    const session = await meRes.json();

    if (session?.user?.role === "super_admin") router.push("/admin");
    else if (session?.user?.role === "company_admin") router.push("/painel");
    else router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-700">VitrineFlow</h1>
        <p className="mb-6 text-sm text-slate-500">Entre com sua conta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
