import { CompanyDetail } from "@/components/company/CompanyDetail";
import { getCompanyDetails } from "@/lib/data";

import { getFunds } from "@/app/actions";

export const dynamic = 'force-dynamic';


export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
    // In Next.js 15+, params is a Promise.
    const { id } = await params;

    // Debug Access
    console.log(`[CompanyPage] Fetching details for ID: ${id}`);

    const [data, funds] = await Promise.all([
        getCompanyDetails(id),
        getFunds()
    ]);

    if (!data) {
        return (
            <div className="p-8 flex flex-col gap-2">
                <h1 className="text-xl font-bold">Company not found</h1>
                <p className="text-muted-foreground">ID: {id}</p>
                <p className="text-xs text-mono text-gray-500">
                    If you see this, the ID exists in the URL but not in the database.
                </p>
            </div>
        );
    }
    return <CompanyDetail initialData={data} funds={funds} />;
}
