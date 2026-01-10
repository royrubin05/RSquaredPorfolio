import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Configuration
// Root Folder ID provided by user: 1VE1Z5KArAE5G8hETp0MXs6SI9F5Nvqy9 (Shared Drive)
const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID || '0APqiJSiuSdaOUk9PVA';
const PORTFOLIO_FOLDER_NAME = '02_Portfolio';
const KEY_FILE_PATH = path.join(process.cwd(), 'scripts/service_account.json');

// Initialize Auth
const getDriveClient = () => {
    // Priority 1: Environment Variable (Vercel Production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            return google.drive({ version: 'v3', auth });
        } catch (e) {
            console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
        }
    }

    // Priority 2: Local File (Development / Scripts)
    // Try absolute path first, then relative to project root
    const possiblePaths = [
        path.join(process.cwd(), 'scripts', 'service_account.json'),
        path.join(process.cwd(), 'service_account.json'),
        './scripts/service_account.json'
    ];

    let explicitKeyFile: string | undefined;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            explicitKeyFile = p;
            break;
        }
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: explicitKeyFile || KEY_FILE_PATH, // Fallback to default
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
};

/**
 * Finds a folder by name within a parent folder.
 */
async function findFolder(name: string, parentId: string) {
    const drive = getDriveClient();
    try {
        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });
        return res.data.files?.[0] || null;
    } catch (error) {
        console.error(`Error finding folder ${name}:`, error);
        return null;
    }
}

/**
 * Creates a folder within a parent folder.
 */
async function createFolder(name: string, parentId: string) {
    const drive = getDriveClient();
    try {
        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        };
        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
            supportsAllDrives: true
        });
        return file.data;
    } catch (error) {
        console.error(`Error creating folder ${name}:`, error);
        throw error;
    }
}

/**
 * Ensures a specific folder path exists: Root -> 02_Portfolio -> CompanyName
 * Returns the ID of the Company Folder.
 */
export async function ensureCompanyFolder(companyName: string): Promise<string | null> {
    try {
        // 1. Find '02_Portfolio' inside Root
        let portfolioFolder = await findFolder(PORTFOLIO_FOLDER_NAME, ROOT_FOLDER_ID);
        if (!portfolioFolder) {
            console.log(`Portfolio folder not found, creating...`);
            portfolioFolder = await createFolder(PORTFOLIO_FOLDER_NAME, ROOT_FOLDER_ID);
        }
        if (!portfolioFolder?.id) throw new Error("Failed to resolve Portfolio folder");

        // 2. Find/Create Company Folder inside 02_Portfolio
        const safeName = companyName.replace(/[/\\?%*:|"<>\.]/g, '-');
        let companyFolder = await findFolder(safeName, portfolioFolder.id);

        if (!companyFolder) {
            companyFolder = await createFolder(safeName, portfolioFolder.id);
        }

        return companyFolder?.id || null;

    } catch (error) {
        console.error("Error managing company folders:", error);
        return null;
    }
}

/**
 * Uploads a file stream to a specific folder.
 */
export async function uploadFileToDrive(
    fileName: string,
    mimeType: string,
    fileStream: any, // Readable stream or buffer
    folderId: string
): Promise<string | null> {
    const drive = getDriveClient();
    try {
        // Convert Buffer to Readable Stream
        const body = (Buffer.isBuffer(fileStream))
            ? Readable.from(fileStream)
            : fileStream;

        const media = {
            mimeType,
            body,
        };
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
            supportsAllDrives: true
        });

        return file.data.id || null;
    } catch (error) {
        console.error(`Error uploading file ${fileName} to Drive:`, error);
        throw error;
    }
}

/**
 * Deletes (trashes) a file by ID.
 */
export async function deleteFileFromDrive(fileId: string) {
    const drive = getDriveClient();
    try {
        await drive.files.update({
            fileId,
            requestBody: { trashed: true },
            supportsAllDrives: true
        });
        return true;
    } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        return false;
    }
}
