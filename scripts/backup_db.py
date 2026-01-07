import os
import sys
import subprocess
import datetime
import shutil
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# --- CONFIGURATION ---
# Load these from environment variables or a .env file
# Ensure you have 'psycopg2-binary' and 'google-api-python-client' 'google-auth' installed
DATABASE_URL = os.getenv("DATABASE_URL")
BACKUP_DIR = Path("backups")
GDRIVE_SERVICE_ACCOUNT_FILE = os.getenv("GDRIVE_SERVICE_ACCOUNT_FILE", "service_account.json")
GDRIVE_FOLDER_ID = os.getenv("GDRIVE_FOLDER_ID") # Optional: specific folder ID in Drive
RETENTION_DAYS = 30

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def ensure_backup_dir():
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True)
        log(f"Created backup directory: {BACKUP_DIR.resolve()}")

def perform_local_backup():
    if not DATABASE_URL:
        log("ERROR: DATABASE_URL not set in environment.")
        return None

    timestamp = datetime.datetime.now().strftime('%Y_%m_%d_%H%M%S')
    filename = f"db_backup_{timestamp}.sql"
    filepath = BACKUP_DIR / filename

    log(f"Starting local backup to {filepath}...")

    # Using pg_dump. 
    # Note: Requires pg_dump to be in PATH.
    try:
        env = os.environ.copy()
        # pg_dump requires connection string or individual params. 
        # We'll pass the URL directly if valid, or let pg_dump handle it.
        # It's safest to use subprocess with the connection string.
        
        command = f'pg_dump "{DATABASE_URL}" -f "{filepath}"'
        
        # Security Note: Be careful printing command with credentials.
        # log(f"Executing: {command}") 
        
        subprocess.run(command, shell=True, check=True, env=env)
        log("Local backup successful.")
        return filepath
    except subprocess.CalledProcessError as e:
        log(f"ERROR: pg_dump failed. {e}")
        return None

def upload_to_drive(local_path):
    if not os.path.exists(GDRIVE_SERVICE_ACCOUNT_FILE):
        log(f"WARNING: Google Drive Service Account file not found at {GDRIVE_SERVICE_ACCOUNT_FILE}. Skipping upload.")
        return

    try:
        log("Authenticating with Google Drive...")
        SCOPES = ['https://www.googleapis.com/auth/drive.file']
        creds = service_account.Credentials.from_service_account_file(
            GDRIVE_SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build('drive', 'v3', credentials=creds)

        file_metadata = {'name': local_path.name}
        if GDRIVE_FOLDER_ID:
            file_metadata['parents'] = [GDRIVE_FOLDER_ID]

        media = MediaFileUpload(local_path, mimetype='application/sql')

        log(f"Uploading {local_path.name} to Drive...")
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        
        log(f"Upload complete. File ID: {file.get('id')}")

    except Exception as e:
        log(f"ERROR: Google Drive upload failed. {e}")

def cleanup_old_backups():
    log(f"Cleaning up local backups older than {RETENTION_DAYS} days...")
    cutoff = datetime.datetime.now() - datetime.timedelta(days=RETENTION_DAYS)
    
    for file in BACKUP_DIR.glob("*.sql"):
        if file.stat().st_mtime < cutoff.timestamp():
            log(f"Deleting old backup: {file.name}")
            os.remove(file)

def main():
    log("=== Backup Job Started ===")
    ensure_backup_dir()
    
    backup_file = perform_local_backup()
    
    if backup_file:
        upload_to_drive(backup_file)
        cleanup_old_backups()
    
    log("=== Backup Job Finished ===")

if __name__ == "__main__":
    main()
