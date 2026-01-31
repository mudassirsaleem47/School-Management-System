const http = require('http');

const PORT = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Hi!\n');
});

server.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
