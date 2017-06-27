const Readable = require('stream').Readable;

function createReadStream(str) {
  const stream = new Readable();
  stream._read = function noop() {};
  stream.push(str);
  stream.push(null);
  return stream;
}

module.exports = createReadStream;
