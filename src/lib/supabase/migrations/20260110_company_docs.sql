-- Create company_documents table
create table "public"."company_documents" (
    "id" uuid not null default gen_random_uuid(),
    "company_id" uuid not null references "public"."companies"("id") on delete cascade,
    "name" text not null,
    "type" text,
    "size" text,
    "url" text not null,
    "created_at" timestamp with time zone default now() not null,
    primary key ("id")
);

-- RLS
alter table "public"."company_documents" enable row level security;
create policy "Enable all access for authenticated users" on "public"."company_documents"
    as permissive for all to authenticated using (true) with check (true);

-- Storage Bucket for Company Docs
insert into storage.buckets (id, name, public)
values ('company_documents', 'company_documents', true)
on conflict (id) do nothing;

create policy "Allow authenticated uploads" on storage.objects
    for insert to authenticated with check (bucket_id = 'company_documents');

create policy "Allow public viewing" on storage.objects
    for select to public using (bucket_id = 'company_documents');
