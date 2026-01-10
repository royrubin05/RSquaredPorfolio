-- Add 'type' and 'files' columns to feature_requests
alter table "public"."feature_requests"
add column "type" text default 'Feature' not null,
add column "files" jsonb default '[]'::jsonb;
