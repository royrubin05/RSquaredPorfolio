import os
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Configuration
SERVICE_ACCOUNT_FILE = 'scripts/service_account.json'
ROOT_FOLDER_ID = '1bYjevGhablxHFTK4KwOXZVw67lgyA2iL'  # Provided by user
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def find_or_create_folder(service, folder_name, parent_id):
    """Checks if a folder exists inside parent_id. If not, creates it."""
    query = f"mimeType='application/vnd.google-apps.folder' and name='{folder_name}' and '{parent_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])

    if files:
        return files[0]['id']
    else:
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(body=file_metadata, fields='id').execute()
        print(f"Created folder '{folder_name}' (ID: {folder['id']})")
        return folder['id']

def ensure_taxonomy(service):
    """Ensures the standard VC folder structure exists."""
    print("Verifying Folder Taxonomy...")
    
    # Level 1: Core Buckets
    admin_id = find_or_create_folder(service, "00_Admin", ROOT_FOLDER_ID)
    funds_id = find_or_create_folder(service, "01_Funds", ROOT_FOLDER_ID)
    portfolio_id = find_or_create_folder(service, "02_Portfolio", ROOT_FOLDER_ID)
    backups_id = find_or_create_folder(service, "99_Backups", ROOT_FOLDER_ID)

    return {
        "Admin": admin_id,
        "Funds": funds_id,
        "Portfolio": portfolio_id,
        "Backups": backups_id
    }

def upload_backup(service, folder_id):
    """Uploads the latest local SQL dump to the Backups folder."""
    backup_dir = 'backups'
    if not os.path.exists(backup_dir):
        print("No local backups directory found.")
        return

    # Find latest SQL file
    files = [f for f in os.listdir(backup_dir) if f.endswith('.sql')]
    if not files:
        print("No SQL backup files found to upload.")
        return
    
    latest_file = max([os.path.join(backup_dir, f) for f in files], key=os.path.getctime)
    filename = os.path.basename(latest_file)

    print(f"Uploading {filename}...")
    
    file_metadata = {
        'name': filename,
        'parents': [folder_id]
    }
    media = MediaFileUpload(latest_file, mimetype='application/sql')
    
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    print(f"Backup uploaded successfully (File ID: {file.get('id')})")

def main():
    try:
        service = authenticate()
        folders = ensure_taxonomy(service)
        
        # Trigger Backup Upload
        upload_backup(service, folders['Backups'])
        
        print("\n✅ Drive Sync Complete.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == '__main__':
    main()
