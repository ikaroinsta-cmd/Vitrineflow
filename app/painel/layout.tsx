import PainelSidebar from "@/components/PainelSidebar";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <PainelSidebar />
      <div className="flex-1 bg-slate-50 p-6">{children}</div>
    </div>
  );
}
