const createReadStream = require('./createReadStream');

function writeToBucket(gcs, bucketName, path, data, writeOptions) {
  return new Promise((resolve, reject) => {
    const file = gcs.bucket(bucketName).file(path);
    createReadStream(data)
    .pipe(file.createWriteStream(writeOptions))
    .on('error', err => reject(err))
    .on('finish', () => resolve());
  });
}

module.exports = writeToBucket;
