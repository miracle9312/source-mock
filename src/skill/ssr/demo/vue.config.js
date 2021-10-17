const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';
const serverConfig = require('./server.config');
const clientConfig = require('./client.config');

if (TARGET_NODE) {
  module.exports = serverConfig;
} else {
  module.exports = clientConfig;
}
