# Supabase Row Level Security (RLS) Setup Guide

## Overview

Your application is connecting to Supabase but is getting empty arrays for data because your tables likely have Row Level Security (RLS) enabled but no policies to allow read access.

## Steps to Fix the Issue

1. Go to your Supabase Dashboard: https://app.supabase.co/
2. Navigate to Authentication → Policies
3. For each table, you need to add appropriate policies:

### League Table RLS Policy

1. Find the 'League' table in the list
2. Click "New Policy"
3. Choose "Create a policy from scratch"
4. For a basic read-only policy:
   - Policy name: `Allow anonymous read access`
   - Target roles: Leave blank for all roles or select `anon` and `authenticated` 
   - Using expression: `true` (this allows all users to read all rows)
   - Definition: Choose "SELECT" to allow read-only access

### Team Table RLS Policy

1. Find the 'Team' table in the list
2. Click "New Policy"
3. Choose "Create a policy from scratch"
4. For a basic read-only policy:
   - Policy name: `Allow anonymous read access`
   - Target roles: Leave blank for all roles or select `anon` and `authenticated`
   - Using expression: `true` (this allows all users to read all rows)
   - Definition: Choose "SELECT" to allow read-only access

## SQL Alternative

If you prefer, you can add policies using SQL. Go to the SQL Editor in Supabase and run:

```sql
-- Enable RLS for League table (if not already enabled)
ALTER TABLE "League" ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous read access to League table
CREATE POLICY "Allow anonymous read access" 
ON "League"
FOR SELECT 
USING (true);

-- Enable RLS for Team table (if not already enabled)
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous read access to Team table
CREATE POLICY "Allow anonymous read access" 
ON "Team"
FOR SELECT 
USING (true);
```

## Verifying Access

After adding the policies, refresh your application and check if the data is now being retrieved. You should see league data appearing in your form instead of the error message.

## Additional Troubleshooting

If you're still having issues after adding the policies:

1. Make sure the column names in your Supabase tables match what your code is expecting
2. Check the network tab in your browser's developer tools for any API errors
3. Run the test script we created (`testSupabase.js`) to check for specific errors
4. Verify that your Supabase URL and Anon Key are correctly set in your `.env` file 