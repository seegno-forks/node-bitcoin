
/**
 * Module dependencies.
 */

import _ from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import StandardError from '../src/errors/standard-error';
import availableMethods from '../src/methods';
import config from './config';
import fs from 'fs';
import nock from 'nock';
import parse from './utils/help-parser-util';
import path from 'path';
import should from 'should';

/**
 * Lowercase rpc methods.
 */

const methods = _.invoke(availableMethods, String.prototype.toLowerCase);

/**
 * Create `client` instance.
 */

const client = new Client(config.bitcoind);

/**
 * Test `Client`.
 */

describe('Client', () => {
  it('should throw an error if a method does not exist', () => {
    return client.cmd('nomethod')
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(RpcError);
        error.message.should.equal('Method not found');
        error.code.should.equal(-32601);
      });
  });

  it('should throw an error with a generic message if one is not return on the response', () => {
    nock(`http://${config.bitcoind.host}:${config.bitcoind.port}`)
      .filteringRequestBody(/.*/, '*')
      .post('/', '*')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    return client.cmd('foobar')
      .then(should.fail)
      .catch((error) => {
        nock.restore();
        nock.cleanAll();

        error.should.be.an.instanceOf(RpcError);
        error.message.should.equal('An error occurred while processing the RPC call to bitcoind');
        error.code.should.equal(-32601);
      });
  });

  it('should return the response headers if `headers` is enabled', () => {
    return new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo()
      .spread((info, headers) => {
        headers.should.have.property('server');
        headers.server.should.startWith('bitcoin-json-rpc');
      });
  });

  it('should return the response headers if `headers` is enabled using callbacks', () => {
    return new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo((err, info, headers) => {
      should.not.exist(err);

      headers.should.have.property('server');
      headers.server.should.startWith('bitcoin-json-rpc');
    });
  });

  describe('methods', () => {
    it('should have all the methods listed by `help`', () => {
      return client.help().then((help) => _.difference(parse(help), methods).should.be.empty);
    });

    it('should not have any commands not listed by `help`', () => {
      const encryptedWalletsCommands = ['walletlock', 'walletpassphrase', 'walletpassphrasechange'];

      // Deprecated in 0.11.0: `gethashespersec`
      // Deprecated in 0.10.0: `getwork`
      const deprecatedCommands = ['gethashespersec', 'getwork'];

      return client.help().then((help) => _.difference(methods, parse(help)).should.eql(_.union(deprecatedCommands, encryptedWalletsCommands)));
    });

    it('should support callbacks', (done) => {
      return client.help((err, help) => {
        should.not.exist(err);

        help.should.not.be.empty;

        done();
      });
    });

    describe('getAccountAddress()', () => {
      it('should retrieve an account address', () => {
        return client.getAccountAddress('test')
          .then(client.getAccount)
          .then((account) => account.should.equal('test'));
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', () => {
        return client.getNewAddress('test')
          .then(() => client.getAddressesByAccount('test'))
          .then((addresses) => addresses.length.should.be.above(1));
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', () => {
        return client.getBalance().then((balance) => balance.should.be.a.number);
      });
    });

    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', () => {
        return client.getDifficulty().then((difficulty) => difficulty.should.be.a.number);
      });
    });

    describe('getInfo()', () => {
      it('should return information about the node and the network', () => {
        return client.getInfo().then((info) => {
          info.should.not.be.empty;
          info.errors.should.equal('');
        });
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions from all accounts using specific count', () => {
        return client.listTransactions('test', 15).then((transactions) => {
          transactions.should.be.an.array;
          transactions.should.have.length(0);
        });
      });

      it('should return the most recent list of transactions from all accounts using default count', () => {
        return client.listTransactions('test').then((transactions) => {
          transactions.should.be.an.array;
          transactions.should.have.length(0);
        });
      });
    });

    describe('help()', () => {
      it('should return help', () => {
        return client.help().then((help) => help.should.not.be.empty);
      });
    });
  });

  describe('batching', () => {
    it('should support batched requests', () => {
      const batch = [];

      _.times(5, _.bind(Array.prototype.push, batch, { method: 'getnewaddress', params: ['test'] }));

      return client.cmd(batch).then((addresses) => addresses.should.have.length(batch.length));
    });

    it('should return the response headers if `headers` is enabled', () => {
      const batch = [];

      _.times(5, _.bind(Array.prototype.push, batch, { method: 'getnewaddress', params: ['test'] }));

      return new Client(_.defaults({ headers: true }, config.bitcoind)).cmd(batch)
        .spread((addresses, headers) => {
          addresses.should.have.length(batch.length);

          headers.should.have.property('server');
          headers.server.should.startWith('bitcoin-json-rpc');
        });
    });

    it('should return the response headers if `headers` is enabled using callbacks', () => {
      const batch = [];

      _.times(5, _.bind(Array.prototype.push, batch, { method: 'getnewaddress', params: ['test'] }));

      return new Client(_.defaults({ headers: true }, config.bitcoind)).cmd(batch, (err, addresses, headers) => {
        should.not.exist(err);

        addresses.should.have.length(batch.length);

        headers.should.have.property('server');
        headers.server.should.startWith('bitcoin-json-rpc');
      });
    });
  });

  describe('config', () => {
    it('should throw an error if network is invalid', () => {
      try {
        /*eslint-disable*/
        new Client(_.defaults({ network: 'foo' }, config.bitcoind));
        /*eslint-enable*/

        should.fail();
      } catch (error) {
        error.should.be.an.instanceOf(StandardError);
        error.message.should.equal('Invalid network name "foo"');
        error.network.should.equal('foo');
      }
    });

    it('should throw an error if credentials are invalid', () => {
      return new Client(_.defaults({ user: 'foo', pass: 'biz' }, config.bitcoind)).getDifficulty()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(RpcError);
          error.message.should.equal('Unauthorized');
          error.code.should.equal(401);
          error.status.should.equal(401);
        });
    });

    it('should throw an error if a connection cannot be established', () => {
      return new Client(_.defaults({ port: 9897 }, config.bitcoind)).getDifficulty()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(Error);
          error.message.should.match(/connect ECONNREFUSED/);
          error.code.should.equal('ECONNREFUSED');
        });
    });
  });

  describe('timeouts', () => {
    it('should have default timeout of 30000ms', () => {
      new Client(_.omit(config, 'timeout')).timeout.should.equal(30000);
    });

    it('should throw an error if timeout is reached', () => {
      return new Client(_.defaults({ timeout: 0.1 }, config.bitcoind)).listAccounts()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(Error);
          error.code.should.match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
        });
    });
  });

  describe('ssl support @ssl', () => {
    it('should use `sslStrict` by default when `ssl` is enabled', () => {
      const sslClient = new Client(_.defaults({ ssl: true, host: config.bitcoindSsl.host, port: config.bitcoindSsl.port }, config.bitcoind));

      sslClient.sslStrict.should.be.true;
    });

    it('should throw an error if certificate is self signed by default', () => {
      const sslClient = new Client(_.defaults({ ssl: true, host: config.bitcoindSsl.host, port: config.bitcoindSsl.port }, config.bitcoind));

      sslClient.sslStrict.should.be.true;

      return sslClient.getInfo()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(Error);
          error.code.should.equal('DEPTH_ZERO_SELF_SIGNED_CERT');
          error.message.should.equal('self signed certificate');
        });
    });

    it('should establish a connection if certificate is self signed but `ca` agent option is passed', () => {
      const sslClient = new Client(_.defaults({
        ssl: true,
        agentOptions: {
          ca: fs.readFileSync(path.join(__dirname, '/config/ssl/server.cert')),
          checkServerIdentity() {
            // Skip server identity checks otherwise the certificate would be immediately rejected
            // as connecting to an IP not listed in the `altname` fails.
            return;
          }
        },
        host: config.bitcoindSsl.host,
        port: config.bitcoindSsl.port
      }, config.bitcoind));

      return sslClient.getInfo().then((info) => info.should.not.be.empty);
    });

    it('should establish a connection if certificate is self signed but `sslStrict` is disabled', () => {
      const sslClient = new Client(_.defaults({ ssl: true, sslStrict: false, host: config.bitcoindSsl.host, port: config.bitcoindSsl.port }, config.bitcoind));

      return sslClient.getInfo().then((info) => info.should.not.be.empty);
    });
  });
});
