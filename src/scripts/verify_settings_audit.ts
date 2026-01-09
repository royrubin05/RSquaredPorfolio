
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAllSettings() {
    console.log('--- Verifying All Settings Fallbacks ---');

    const keysToCheck = [
        { key: 'company_statuses', label: 'Company Statuses', defaultSize: 4 },
        { key: 'available_countries', label: 'Countries', defaultSize: 15 }
    ];

    for (const item of keysToCheck) {
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .eq('key', item.key)
            .maybeSingle();

        if (settings) {
            console.log(`✅ [${item.label}] Found in DB.`);
            console.log(`   Value: ${JSON.stringify(settings.value)}`);
        } else {
            console.log(`❌ [${item.label}] NOT found in DB.`);
            console.log(`   System is using HARDCODED fallback.`);

            if (item.key === 'company_statuses') {
                console.log(`   Migrating default ${item.label}...`);
                const defaults = ['Active', 'Watchlist', 'Exit', 'Shutdown'];

                const { error } = await supabase.from('settings').insert({
                    key: item.key,
                    value: defaults
                });

                if (error) {
                    console.error('   ❌ Migration Failed:', error.message);
                } else {
                    console.log('   ✅ Migrated to DB.');
                }
            } else {
                console.log('   Skipping migration as requested.');
            }
        }
    }
}

verifyAllSettings();
