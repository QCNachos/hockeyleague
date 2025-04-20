// Simple MCP server for Supabase
const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://kodoxoactqqajqrdnozg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZG94b2FjdHFxYWpxcmRub3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Nzc1NjgsImV4cCI6MjA1OTA1MzU2OH0.qB0SV_fa0YE0oG7BNLVh2h8McEvTvqyvtOOAqpo9TqI';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Return a simple status
console.log(JSON.stringify({
  status: "Connected to Supabase",
  projectId: "kodoxoactqqajqrdnozg",
  url: supabaseUrl
}));

// In a real MCP server, you would handle various commands here
// This is just a simplified version for demonstration 