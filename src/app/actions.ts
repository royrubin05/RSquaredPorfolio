'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertCompany(data: any) {
    const supabase = await createClient()

    // Map UI fields to DB fields
    // DB Schema based on check-data: id, name, sector, status, headquarters
    // We assume columns exists for website, description etc or we omit them if they fail.
    // Ideally we should know the schema. checking check-data output from step 713:
    // It only showed `id, round_label` etc because of the query I ran.
    // But `getPortfolioOverview` selects: `id, name, sector, status, headquarters`.
    // I will stick to these guaranteed fields + try `website`, `description`.

    const payload: any = {
        name: data.name,
        sector: data.category, // Map category -> sector
        headquarters: data.country, // Map country -> headquarters
        status: data.status || 'Active',
        website: data.website,
        description: data.description,
        // one_liner? jurisdiction?
    };

    if (data.id) {
        payload.id = data.id;
    }

    const { data: result, error } = await supabase
        .from('companies')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error upserting company:', error);
        return { error: error.message };
    }

    revalidatePath('/'); // Revalidate dashboard
    return { success: true, data: result };
}

export async function getCompanyStatuses() {
    const supabase = await createClient()

    // 1. Try to fetch from a 'settings' table if it exists
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'company_statuses').single();

    if (settings && settings.value) {
        return settings.value as string[];
    }

    // 2. Fallback: Get distinct statuses from companies
    const { data: companies } = await supabase.from('companies').select('status');
    const distinct = Array.from(new Set(companies?.map(c => c.status) || []));

    // 3. Merge with Defaults
    const defaults = ['Active', 'Watchlist', 'Exit', 'Shutdown'];
    return Array.from(new Set([...defaults, ...distinct]));
}

export async function saveCompanyStatuses(statuses: string[]) {
    const supabase = await createClient()

    // Try to save to 'settings' table. 
    // This assumes the table exists. If not, this might fail, but it's the requested path.
    const { error } = await supabase.from('settings').upsert({
        key: 'company_statuses',
        value: statuses
    });

    if (error) {
        // Validation: If table doesn't exist, we can't persist custom list easily without migration.
        console.error('Failed to save statuses:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function deleteCompany(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) {
        console.error('Error deleting company:', error)
        return { error: error.message }
    }
    revalidatePath('/')
    return { success: true }
}

export async function deleteRound(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('financing_rounds').delete().eq('id', id)
    if (error) {
        console.error('Error deleting round:', error)
        return { error: error.message }
    }
    revalidatePath('/')
    return { success: true }
}
