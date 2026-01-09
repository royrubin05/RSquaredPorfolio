
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

async function verifyIndustries() {
    console.log('--- Verifying Industries Settings ---');

    // 1. Check Settings Table
    const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'available_categories')
        .maybeSingle();

    if (error) {
        console.error('Error fetching settings:', error.message);
        return;
    }

    if (settings) {
        console.log('✅ Found "available_categories" in [settings] table.');
        console.log('Values:', settings.value);
    } else {
        console.log('❌ "available_categories" NOT found in [settings] table.');
        console.log('System is currently using the HARDCODED fallback list.');

        // Optional: Insert defaults?
        console.log('Migrating defaults to database...');
        const defaults = ["AI", "Fintech", "SaaS", "Consumer", "Health", "Infra", "Crypto", "Marketplace", "Deep Tech", "Real Estate"];

        const { error: insertError } = await supabase.from('settings').insert({
            key: 'available_categories',
            value: defaults
        });

        if (insertError) {
            console.error('Failed to migrate:', insertError.message);
        } else {
            console.log('✅ Successfully migrated default industries to [settings] table.');
        }
    }
}

verifyIndustries();
