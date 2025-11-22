-- Create profiles table
create table profiles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  start_date date not null,
  end_date date not null,
  unit text not null check (unit in ('day', 'week', 'month', 'year')),
  color text default '#3b82f6',
  user_id uuid references auth.users not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profiles" on profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profiles" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profiles" on profiles
  for update using (auth.uid() = user_id);

create policy "Users can delete their own profiles" on profiles
  for delete using (auth.uid() = user_id);
