import { MasterDashboard } from "@/components/dashboard/MasterDashboard";
import { getPortfolioOverview } from "@/lib/data";

export const dynamic = 'force-dynamic'; // Ensure real-time data for now

export default async function Home() {
  const data = await getPortfolioOverview();

  return <MasterDashboard {...data} />;
}
