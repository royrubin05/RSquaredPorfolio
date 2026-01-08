import { InvestorRolodex } from "@/components/investor/InvestorRolodex";
import { getCoInvestors } from "../actions";

export const dynamic = 'force-dynamic';

export default async function InvestorsPage() {
    const investors = await getCoInvestors();
    return <InvestorRolodex initialInvestors={investors} />;
}
