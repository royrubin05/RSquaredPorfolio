import { MasterDashboard } from "@/components/dashboard/MasterDashboard";
import { getPortfolioOverview } from "@/lib/data";
import { getLatestRounds } from "@/app/actions";

export const dynamic = 'force-dynamic'; // Ensure real-time data for now

export default async function Home() {
  const data = await getPortfolioOverview();
  const latestRounds = await getLatestRounds();

  return <MasterDashboard {...data} latestRounds={latestRounds} />;
}
