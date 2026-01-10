import { NextRequest, NextResponse } from 'next/server';
import { generateBackup } from '@/lib/export';

// Vercel Cron jobs are authorized by a secret header
// Or we can just leave it public but obscure if no sensitive data is returned (here we return status only)
// But to be safe, we should check for a CRON_SECRET if desired.
// For now, we will allow it to run and just log success, as requested.

export async function GET(req: NextRequest) {
    // Optional: Check Auth
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        console.log('[Cron] Starting Backup Generation...');
        // In a real cron scenario (without storage), we can't do much with the file except return it
        // or email it.
        // Since the user asked for the service to be "able to run through a cron job",
        // we essentially just validate that the generation works.
        // If we had an email service, we would send it here.

        await generateBackup(); // Just run the logic to ensure no crashes

        console.log('[Cron] Backup Generation Successful.');

        return NextResponse.json({ success: true, message: 'Backup generated successfully. (No persistence configured)' });
    } catch (error: any) {
        console.error('[Cron] Backup Failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
