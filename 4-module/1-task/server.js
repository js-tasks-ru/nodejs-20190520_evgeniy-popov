const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      fs.createReadStream(filepath)
        .on('error', err => {
          if (path.dirname(filepath) !== path.join(__dirname, 'files')) {
            res.statusCode = 400;
            res.end('Nested directories are not supported');
          } else if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('not found');
          } else {
            res.statusCode = 500;
            res.end('internal error');
          }
        }).pipe(res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
