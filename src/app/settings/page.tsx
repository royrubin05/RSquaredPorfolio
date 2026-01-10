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

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-12">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>

            <section className="space-y-4">
                <SettingsPage
                    initialFunds={funds}
                    initialIndustries={industries}
                    initialTeam={team}
                    initialEquityTypes={equityTypes}
                />
            </section>
        </div>
    );
}
