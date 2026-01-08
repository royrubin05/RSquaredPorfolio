import { SettingsPage } from "@/components/settings/SettingsPage";
import { getFunds, getIndustries, getTeamMembers } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const [funds, industries, team] = await Promise.all([
        getFunds(),
        getIndustries(),
        getTeamMembers()
    ]);

    return <SettingsPage initialFunds={funds} initialIndustries={industries} initialTeam={team} />;
}
