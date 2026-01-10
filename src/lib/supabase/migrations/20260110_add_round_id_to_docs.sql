-- Add round_id to company_documents to associate docs with specific rounds
alter table "public"."company_documents" 
add column if not exists "round_id" uuid references "public"."financing_rounds"("id") on delete cascade;
