
import { google } from 'googleapis';
import { Readable } from 'stream';

// Singleton for auth
const SCOPES = ['https://www.googleapis.com/auth/drive'];

function getDriveClient() {
    // Decode the private key if it's base64 encoded or handle newlines
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
        throw new Error('Missing Google Drive Credentials (GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL)');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            private_key: privateKey,
            client_email: clientEmail,
        },
        scopes: SCOPES,
    });

    return google.drive({ version: 'v3', auth });
}

export const driveService = {
    /**
     * Creates a folder if it doesn't exist, or returns the existing ID.
     * Note: This simple version just creates. To check first, we'd need to search by name + parent.
     */
    async ensureFolder(folderName: string, parentId?: string): Promise<string> {
        const drive = getDriveClient();

        // 1. Check if exists
        let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id!;
        }

        // 2. Create if not exists
        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentId) {
            fileMetadata.parents = [parentId];
        }

        const newFolder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        });

        return newFolder.data.id!;
    },

    /**
     * Uploads a file buffer to a specific folder.
     */
    async uploadFile(
        fileName: string,
        fileMimeType: string,
        fileBuffer: Buffer,
        folderId: string
    ) {
        const drive = getDriveClient();

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const media = {
            mimeType: fileMimeType,
            body: Readable.from(fileBuffer),
        };

        const res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        return {
            id: res.data.id!,
            viewLink: res.data.webViewLink!,
            downloadLink: res.data.webContentLink!
        };
    }
};
