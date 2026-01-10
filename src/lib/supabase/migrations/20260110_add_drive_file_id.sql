-- Add drive_file_id to company_documents
alter table "public"."company_documents"
add column "drive_file_id" text;
