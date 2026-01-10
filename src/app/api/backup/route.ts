import { NextRequest, NextResponse } from 'next/server';
import { generateBackup } from '@/lib/export';
import { ensureBackupFolder, uploadFileToDrive } from '@/lib/google_drive';

export async function GET(req: NextRequest) {
    try {
        console.log('[Cron] Starting Backup Generation...');

        // 1. Generate Backup (Returns Base64)
        const base64Data = await generateBackup();
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Prepare Filename
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `vc_portfolio_backup_${dateStr}.zip`;

        // 3. Ensure Backup Folder
        const backupFolderId = await ensureBackupFolder();
        if (!backupFolderId) {
            throw new Error("Failed to resolve 01_Backups folder.");
        }

        // 4. Upload to Drive
        console.log(`[Cron] Uploading ${fileName} to Drive...`);
        const fileId = await uploadFileToDrive(fileName, 'application/zip', buffer, backupFolderId);

        if (!fileId) {
            throw new Error("Failed to upload backup to Drive.");
        }

        console.log(`[Cron] Backup Uploaded Successfully. ID: ${fileId}`);

        return NextResponse.json({
            success: true,
            message: `Backup generated and uploaded to Drive. File ID: ${fileId}`
        });

    } catch (error: any) {
        console.error('[Cron] Backup Failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
