const { ensureCompanyFolder, uploadFileToDrive, deleteFileFromDrive } = require('../src/lib/google_drive');
const fs = require('fs');
const path = require('path');

// Mock Env if needed, but google_drive.ts handles it or reads file
// Ensure TypeScript compilation or use ts-node if possible. 
// Since we are running JS, we need to compile or allow require of .ts? 
// Actually, `ts-node` is available in environment usually.
// Or we can just use `ts-node` to run this.

async function verify() {
    console.log("Starting Verification...");
    const testCompany = "Test Company Verification";
    const testFile = "test_upload.txt";
    const testContent = "This is a test file to verify Shared Drive permissions.";

    try {
        // 1. Ensure Folder
        console.log(`1. Ensuring Folder for '${testCompany}'...`);
        const folderId = await ensureCompanyFolder(testCompany);

        if (!folderId) {
            console.error("❌ Failed to create/find folder.");
            process.exit(1);
        }
        console.log(`✅ Folder ID: ${folderId}`);

        // 2. Upload File
        console.log(`2. Uploading '${testFile}'...`);
        const buffer = Buffer.from(testContent, 'utf-8');
        const fileId = await uploadFileToDrive(testFile, 'text/plain', buffer, folderId);

        if (!fileId) {
            console.error("❌ Failed to upload file.");
            process.exit(1);
        }
        console.log(`✅ File Uploaded. ID: ${fileId}`);

        // 3. Delete File (Clean up)
        console.log(`3. Deleting File...`);
        const deleted = await deleteFileFromDrive(fileId);
        if (deleted) {
            console.log(`✅ File Deleted (Trashed).`);
        } else {
            console.error("❌ Failed to delete file.");
        }

        console.log("🎉 VERIFICATION SUCCESSFUL!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verify();
