
/**
 * Module dependencies.
 */

import _ from 'lodash';
import { parse, request as rpc } from './rpc';
import Promise from 'bluebird';
import StandardError from './errors/standard-error';
import methods from './methods';
import networks from './networks';
import request from 'request';

/**
 * Promisify `request` library.
 */

Promise.promisifyAll(request);

/**
 * Constructor.
 */

class Client {
  constructor({
    agentOptions = undefined,
    headers = false,
    host = 'localhost',
    network = 'mainnet',
    pass = undefined,
    port = 8332,
    ssl = false,
    sslStrict = true,
    timeout = 30000,
    user = undefined
  }) {
    if (!networks.includes(network)) {
      throw new StandardError(`Invalid network name "${network}"`, { network });
    }

    this.agentOptions = agentOptions;
    this.headers = headers;
    this.host = host;
    this.user = user;
    this.pass = pass;
    this.port = port;
    this.timeout = timeout;
    this.ssl = ssl;
    this.sslStrict = sslStrict;
  }

  /**
   * Execute `rpc` command.
   */

  cmd(...args) {
    let body;
    let callback;
    let params = _.rest(args);
    const method = _.first(args);
    const lastArg = _.last(args);

    if (_.isFunction(lastArg)) {
      callback = lastArg;
      params = _.dropRight(params);
    }

    if (Array.isArray(method)) {
      body = method.map((name, index) => rpc(method.name, method.params, index));
    } else {
      body = rpc(method, params);
    }

    return request.postAsync({
      agentOptions: this.agentOptions,
      auth: {
        user: this.user,
        pass: this.pass
      },
      body,
      json: true,
      strictSSL: this.sslStrict,
      timeout: this.timeout,
      uri: `${this.ssl ? 'https' : 'http'}://${this.host}:${this.port}`
    })
    .bind(this)
    .spread(_.partialRight(parse, { headers: this.headers }))
    .nodeify(callback, { spread: true });
  }
}

/**
 * Add all available `rpc` methods.
 */

methods.forEach((method) => {
  Client.prototype[method] = _.partial(Client.prototype.cmd, method.toLowerCase());
});

/**
 * Export `Client`.
 */

export default Client;
