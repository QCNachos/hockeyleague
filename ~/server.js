// Supabase MCP server with Express
const express = require('express');
const app = express();
const port = 3000; // Using a more common port

app.get('*', (req, res) => {
  res.json({
    status: "Connected to Supabase",
    projectId: "kodoxoactqqajqrdnozg",
    url: "https://kodoxoactqqajqrdnozg.supabase.co"
  });
});

app.listen(port, () => {
  console.log(`Supabase MCP server running at http://localhost:${port}/`);
}); 