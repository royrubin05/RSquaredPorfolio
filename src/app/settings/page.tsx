import { getFunds, getIndustries, getTeamMembers, getEquityTypes } from "@/app/actions";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const [funds, industries, team, equityTypes] = await Promise.all([
        getFunds(),
        getIndustries(),
        getTeamMembers(),
        getEquityTypes()
    ]);

    return <SettingsPage initialFunds={funds} initialIndustries={industries} initialTeam={team} initialEquityTypes={equityTypes} />;
}
