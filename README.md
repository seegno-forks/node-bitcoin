# node-bitcoin

`node-bitcoin` is a simple wrapper for the Bitcoin client's JSON-RPC API.

The API is equivalent to the [list of RPC calls](https://bitcoin.org/en/developer-reference#remote-procedure-calls-rpcs) available on the Bitcoin client.

The methods are exposed as (lower) camelcase methods (e.g. `methodName`) on the `Client` object, or you may call the API directly using the `cmd` method.

## Status

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

## Installation

Install the package via `npm`:

```sh
$ npm install bitcoin
```

## Usage

### Create a client

```js
var BitcoinClient = require('bitcoin');
var client = new BitcoinClient();
```

#### Arguments
1. `options` *(object)*: The url with parameters to escape.
  - `agentOptions` *(string)*: Agent options to pass directly to the `request` module (default: `undefined`).
  - `headers` *(string)*: Whether to return headers as part of any response (default: `false`).
  - `host` *(string)*: The host to connect to (default: `localhost`).
  - `network` *(string)*: The network to connect to (default: `mainnet`).
  - `pass` *(string)*: The rpc password to use for authentication (default: `undefined`).
  - `port` *(string)*: The rpc port to connect to (default: `8332`).
  - `ssl` *(string)*: Whether to use SSL or not (default: `false`)
  - `sslStrict` *(string)*: Whether to be strict about SSL certificate validation (default: `true`)
  - `timeout` *(string)*: Timeout for requests in ms (default: `30000`)
  - `user` *(string)*: The rpc user to use for authentication (default: `undefined`)

#### Examples

All methods provide support for Promises *and* callbacks. Choose the one you prefer to work with by calling the method without a callback (returning a Promise) or by passing it as the last parameter of any method.

##### Get balance across all accounts with minimum confirmations of 6

```js
// Using promise-style.
client.getBalance('*', 6).then(function(balance) {
  console.log('Balance:', balance);
});

// Using callback-style.
client.getBalance('*', 6, function(err, balance) {
  if (err) throw err;
  console.log('Balance:', balance);
});
```

##### Getting the balance directly using `cmd`

```js
client.cmd('getbalance', '*', 6).then(function(balance){
  console.log('Balance:', balance);
});
```

##### Batch multiple RPC calls into a single HTTP request

Note that you receive a single result and it is up to you to check each response error individually.
This means that a single array is returned either when using promises or callbacks.

```js
var batch = [];

for (var i = 0; i < 10; ++i) {
  batch.push({
    method: 'getnewaddress',
    params: ['myaccount']
  });
}

client.cmd(batch).then(function(addresses) {
  console.log('Addresses:', addresses);
});
```

### Enabling response headers

Returning the response headers is disabled by default since it is unnecessary for most use-cases.
If you want to receive them as part of every request, you may set the `headers` option when instantiating the client.

```js
var client = new BitcoinClient({
  headers: true
});
```

When using promises, you will receive an array instead of a single return value, so it is recommended to use `spread()` for spreading the return values as arguments. When using callbacks, the last argument will be the headers object.

```js
// Using promise-style (with `then`).
client.getBalance('*', 6).then(function(result) {
  console.log('Balance:', result[0]);
  console.log('Headers:', result[1]);
});

// Using promise-style (with `spread`).
client.getBalance('*', 6).spread(function(balance, headers) {
  console.log('Balance:', balance);
  console.log('Headers:', headers);
});

// Using callback-style.
client.getBalance('*', 6, function(err, balance, headers) {
  if (err) throw err;
  console.log('Balance:', balance);
  console.log('Headers:', headers);
});
```

### Enabling SSL

By default, bitcoin is configured to allow normal HTTP requests to its RPC server. However, it can be configured to allow HTTPS too.
It is highly recommended to enable SSL on your bitcoind daemon, especially if communication is being sent over a network.

You can learn more on [how to enable SSL on the bitcoind daemon](https://en.bitcoin.it/wiki/Enabling_SSL_on_original_client_daemon).

Optionally, to guarantee that you're connecting to a trusted daemon, the SSL should be signed by a Certificate Authority (CA).
Once you have this setup, you can pass the CA certificate to the client, so that SSL validation is executed.
The default trust store of node/io.js is used if no `ca` option is passed.

```js
var fs = require('fs');
var client = new BitcoindClient({
  agentOptions: {
    ca: fs.readFileSync(__dirname + '/ca.crt')
  },
  ssl: true,
  sslStrict: true
});
```

## Tests

For best results, consider using Docker for running tests, as the project is pre-configured with a `docker-compose` distribution file in order to start two bitcoind nodes on regtest (one with and one without SSL activated), in addition to running the test suite.

Tests can be started using the standard command:

```
$ npm test
```

It is also possible to run the tests directly on the Docker host while still connecting to the bitcoind nodes running on Docker containers. This can be useful for debugging.

```
$ npm run testonly
```

Running tests exclusive on the host (i.e. without having to install Docker) requires launching two bitcoind nodes manually and then running the test suite.
Here's an example of running two bitcoind nodes, one with and one without SSL support:

```
bitcoind -datadir=/var/lib/bitcoind \
  -regtest=1
  -rest
  -rpcallowip=127.0.0.1
  -rpcpassword=bar
  -rpcuser=foo
  -server

bitcoind -datadir=/var/lib/bitcoind \
  -regtest=1
  -rest
  -rpcallowip=127.0.0.1
  -rpcpassword=bar
  -rpcuser=foo
  -rpcssl
  -rpcsslcertificatechainfile=test/config/ssl/server.cert
  -rpcsslprivatekeyfile=test/config/ssl/server.pem
  -server
```

Edit `test/config/index.js` and set your host correctly. Then run tests locally:

```
$ npm run testonly
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/node-bitcoin.svg
[npm-url]: https://www.npmjs.com/package/node-bitcoin
[travis-image]: https://travis-ci.org/freewil/node-bitcoin.svg
[travis-url]: https://travis-ci.org/freewil/node-bitcoin
