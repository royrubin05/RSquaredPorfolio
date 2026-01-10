import { getFunds, getIndustries, getTeamMembers, getEquityTypes } from "@/app/actions";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { TeamManager } from "@/components/settings/TeamManager";

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
                <h2 className="text-xl font-semibold border-b pb-2">User Management</h2>
                <TeamManager initialMembers={team} />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">System Configurations</h2>
                <SettingsPage
                    initialFunds={funds}
                    initialIndustries={industries}
                    initialEquityTypes={equityTypes}
                />
            </section>
        </div>
    );
}
