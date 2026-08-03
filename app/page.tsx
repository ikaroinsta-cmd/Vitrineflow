import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "super_admin") redirect("/admin");
  if (session?.user.role === "company_admin") redirect("/painel");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold text-brand-700">VitrineFlow</h1>
      <p className="max-w-md text-slate-600">
        Crie a vitrine ou loja online da sua empresa em minutos. Gerencie produtos, pedidos e
        pagamentos em um só lugar.
      </p>
      <Link href="/login" className="btn btn-primary">
        Entrar
      </Link>
    </main>
  );
}
