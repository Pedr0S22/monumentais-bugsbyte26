import { ReactNode } from "react";
import { Nav } from "./Nav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">{children}</main>
    </div>
  );
}
