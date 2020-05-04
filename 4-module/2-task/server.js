const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const limitStream = new LimitSizeStream({limit: 10000, encoding: 'utf-8'});

  switch (req.method) {
    case 'POST':
      req
        .pipe(limitStream)
        .pipe(fs.createWriteStream(filepath, {flags: 'wx'}))
        .on('error', err => {
            if(err.code === 'EEXIST') {
              res.statusCode = 409;
              res.end('already exist');
            } else {
              res.statusCode = 501;
              res.end('internal error');
            }
        })
        .on('close', () =>{
        res.statusCode = 201;
        res.end('File created');
      });
      req.on('aborted', () => {
        fs.unlink(filepath, () => {});
      });
      limitStream.on('error', (err) =>{
        if (err.code === 'LIMIT_EXCEEDED'){
          res.statusCode = 413;
          res.end('File is too big');
          fs.unlink(filepath, () => {});
        }
      });
      break;
    case 'DELETE':
      fs.unlink(filepath, (err) => {
        if(err) {
          if(err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File not found');
          } else {
            res.statusCode = 500;
            res.end('internal server error');
          }
        } else {
          res.end('ok');
        }
      });

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
