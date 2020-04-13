const stream = require('stream');
const os = require('os');
const endOfLine = require('os').EOL;

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.noEndOfLIne = '';
  }

  _transform(chunk, encoding, callback) {
    let chunkToString = this.noEndOfLIne + chunk.toString('utf-8');
    const arrayLines = chunkToString.split(endOfLine);
    this.lastLine = arrayLines.pop();
    arrayLines.forEach(line => {
      this.push(line)
    });
    if (this.lastLine.endsWith(endOfLine)) {
      this.push(this.lastLine);
    } else {
      this.noEndOfLIne = this.lastLine;
    }
    callback();
  }

  _flush(callback) {
    if (this.noEndOfLIne) {
      this.push(this.noEndOfLIne);
    }
    callback();
  }
}
module.exports = LineSplitStream;
