import { useQuery } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { EnergyBar } from "./components/EnergyBar";
import { MealForm } from "./components/MealForm";
import { MealList } from "./components/MealList";
import { ChatPanel } from "./components/ChatPanel";
import { fetchEnergy } from "./api/client";
import "./index.css";

function EnergySection() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["energy"], queryFn: fetchEnergy, refetchInterval: 60_000 });
  if (isLoading) return <div className="text-sm text-white/70">Loading energy…</div>;
  if (isError) return <div className="text-sm text-lettyRed">{(error as Error).message}</div>;
  if (!data) return <div className="text-sm text-white/70">No energy data yet.</div>;
  return <EnergyBar percent={data.energy_percent} crash={data.crash_risk} />;
}

export function App() {
  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Energy</h2>
            <EnergySection />
          </section>
          <section>
            <MealForm />
          </section>
          <section className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent meals</h3>
            <MealList />
          </section>
        </div>
        <div className="space-y-6">
          <ChatPanel />
        </div>
      </div>
    </Layout>
  );
}

export default App;
