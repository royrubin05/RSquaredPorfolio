-- Create a new storage bucket for Roadmap Files
insert into storage.buckets (id, name, public)
values ('roadmap_files', 'roadmap_files', true);

-- Policy to allow authenticated uploads
create policy "Authenticated users can upload roadmap files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'roadmap_files' );

-- Policy to allow public viewing (since it's a public bucket)
create policy "Anyone can view roadmap files"
on storage.objects for select
to public
using ( bucket_id = 'roadmap_files' );
