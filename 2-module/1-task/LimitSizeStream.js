const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.chunkLength = null;
  }
  _transform(chunk, encoding, callback) {
    this.chunkLength += chunk.length;
    this.name = chunk;
    this.chunkLength > this.limit ? callback(new LimitExceededError()) : callback(null, this.name);
  }
}

module.exports = LimitSizeStream;
