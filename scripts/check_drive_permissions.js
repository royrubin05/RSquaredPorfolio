const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_FILE_PATH = path.join(__dirname, 'service_account.json');
// Using the ID from google_drive.ts
const ROOT_FOLDER_ID = '1bYjevGhablxHFTK4KwOXZVw67lgyA2iL';

async function checkAccess() {
    console.log('--- Google Drive Permission Check ---');

    if (!fs.existsSync(KEY_FILE_PATH)) {
        console.error(`Error: Service account file not found at ${KEY_FILE_PATH}`);
        return;
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE_PATH,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    console.log('Authenticating...');
    try {
        const about = await drive.about.get({ fields: 'user, storageQuota' });
        console.log(`Authenticated as: ${about.data.user.emailAddress}`);
    } catch (e) {
        console.error('Auth Failed:', e.message);
        return;
    }

    console.log(`\nChecking Root Folder: ${ROOT_FOLDER_ID}...`);
    try {
        const file = await drive.files.get({
            fileId: ROOT_FOLDER_ID,
            fields: 'id, name, capabilities, owners'
        });
        console.log(`SUCCESS: Found Root Folder: "${file.data.name}"`);
        console.log(`- Can Add Children (Write): ${file.data.capabilities.canAddChildren}`);
        console.log(`- Can List Children (Read): ${file.data.capabilities.canListChildren}`);
        console.log(`- Capabilities:`, JSON.stringify(file.data.capabilities, null, 2));
    } catch (e) {
        console.error(`FAILED to access Root Folder: ${e.message}`);

        console.log("\nInstead, verifying what I CAN see:");
        try {
            const list = await drive.files.list({
                pageSize: 10,
                fields: 'files(id, name, parents)',
                q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            });

            if (list.data.files.length === 0) {
                console.log("No folders visible. Service Account has access to NOTHING.");
            } else {
                console.log("Visible Folders:");
                list.data.files.forEach(f => console.log(`- [${f.name}] (ID: ${f.id})`));
            }
        } catch (listErr) {
            console.error("Failed to list files:", listErr.message);
        }
    }
}

checkAccess();
