
/**
 * Module dependencies.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rpc = require('./rpc');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _errorsStandardError = require('./errors/standard-error');

var _errorsStandardError2 = _interopRequireDefault(_errorsStandardError);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

var _networks = require('./networks');

var _networks2 = _interopRequireDefault(_networks);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

/**
 * Promisify `request` library.
 */

_bluebird2['default'].promisifyAll(_request2['default']);

/**
 * Constructor.
 */

var Client = (function () {
  function Client(_ref) {
    var _ref$agentOptions = _ref.agentOptions;
    var agentOptions = _ref$agentOptions === undefined ? undefined : _ref$agentOptions;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? false : _ref$headers;
    var _ref$host = _ref.host;
    var host = _ref$host === undefined ? 'localhost' : _ref$host;
    var _ref$network = _ref.network;
    var network = _ref$network === undefined ? 'mainnet' : _ref$network;
    var _ref$pass = _ref.pass;
    var pass = _ref$pass === undefined ? undefined : _ref$pass;
    var _ref$port = _ref.port;
    var port = _ref$port === undefined ? 8332 : _ref$port;
    var _ref$ssl = _ref.ssl;
    var ssl = _ref$ssl === undefined ? false : _ref$ssl;
    var _ref$sslStrict = _ref.sslStrict;
    var sslStrict = _ref$sslStrict === undefined ? true : _ref$sslStrict;
    var _ref$timeout = _ref.timeout;
    var timeout = _ref$timeout === undefined ? 30000 : _ref$timeout;
    var _ref$user = _ref.user;
    var user = _ref$user === undefined ? undefined : _ref$user;

    _classCallCheck(this, Client);

    if (!_networks2['default'].includes(network)) {
      throw new _errorsStandardError2['default']('Invalid network name "' + network + '"', { network: network });
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
   * Add all available `rpc` methods.
   */

  /**
   * Execute `rpc` command.
   */

  Client.prototype.cmd = function cmd() {
    var body = undefined;
    var callback = undefined;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var params = _lodash2['default'].rest(args);
    var method = _lodash2['default'].first(args);
    var lastArg = _lodash2['default'].last(args);

    if (_lodash2['default'].isFunction(lastArg)) {
      callback = lastArg;
      params = _lodash2['default'].dropRight(params);
    }

    if (Array.isArray(method)) {
      body = method.map(function (name, index) {
        return _rpc.request(method.name, method.params, index);
      });
    } else {
      body = _rpc.request(method, params);
    }

    return _request2['default'].postAsync({
      agentOptions: this.agentOptions,
      auth: {
        user: this.user,
        pass: this.pass
      },
      body: body,
      json: true,
      strictSSL: this.sslStrict,
      timeout: this.timeout,
      uri: (this.ssl ? 'https' : 'http') + '://' + this.host + ':' + this.port
    }).bind(this).spread(_lodash2['default'].partialRight(_rpc.parse, { headers: this.headers })).nodeify(callback, { spread: true });
  };

  return Client;
})();

_methods2['default'].forEach(function (method) {
  Client.prototype[method] = _lodash2['default'].partial(Client.prototype.cmd, method.toLowerCase());
});

/**
 * Export `Client`.
 */

exports['default'] = Client;
module.exports = exports['default'];