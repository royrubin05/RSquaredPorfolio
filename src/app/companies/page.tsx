import { CompanyList } from "@/components/company/CompanyList";
import { getCompaniesList } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
    const companies = await getCompaniesList();
    return <CompanyList initialCompanies={companies} />;
}
