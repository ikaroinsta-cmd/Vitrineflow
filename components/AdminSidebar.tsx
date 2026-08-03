"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/empresas", label: "Empresas" }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-white p-4">
      <h2 className="mb-6 text-lg font-bold text-brand-700">VitrineFlow Admin</h2>
      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 text-sm ${
              pathname === link.href
                ? "bg-brand-50 font-medium text-brand-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Sair
      </button>
    </aside>
  );
}
