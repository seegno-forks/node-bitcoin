
/**
 * Module dependencies.
 */

import _ from 'lodash';

/**
 * Export `config`.
 */

const url = require('url');

/**
 * Default config for docker-based test suite.
 */

let config = {
  bitcoind: {
    host: 'bitcoind',
    port: 18332,
    user: 'foo',
    pass: 'bar'
  },
  bitcoindSsl: {
    host: 'bitcoindssl',
    port: 18332,
    user: 'foo',
    pass: 'bar'
  }
};

/**
 * Allow running tests on the docker host directly,
 * while keeping the bitcoind instance running inside
 * containers.
 */

if (process.env.DOCKER_HOST) {
  const host = url.parse(process.env.DOCKER_HOST).hostname;

  config = _.defaultsDeep({
    bitcoind: {
      host
    },
    bitcoindSsl: {
      host,
      port: 18333
    }
  }, config);
}

/**
 * Export `config`.
 */

export default config;
