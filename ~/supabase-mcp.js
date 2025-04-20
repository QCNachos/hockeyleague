// Supabase MCP server
const http = require('http');
const port = 54322;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const responseData = {
    status: "Connected to Supabase",
    projectId: "kodoxoactqqajqrdnozg",
    url: "https://kodoxoactqqajqrdnozg.supabase.co",
    tables: [],
    schemas: ["public"]
  };
  
  res.end(JSON.stringify(responseData));
});

server.listen(port, () => {
  console.log(`Supabase MCP server running at http://localhost:${port}/`);
}); 