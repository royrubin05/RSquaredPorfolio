import { CompanyList } from "@/components/company/CompanyList";
import { getCompaniesList } from "@/lib/data";
import { getFunds } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
    const [companies, funds] = await Promise.all([
        getCompaniesList(),
        getFunds()
    ]);

    return <CompanyList initialCompanies={companies} initialFunds={funds} />;
}
