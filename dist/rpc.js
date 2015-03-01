
/**
 * Module dependencies.
 */

'use strict';

exports.__esModule = true;
exports.request = request;
exports.parse = parse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _errorsRpcError = require('./errors/rpc-error');

var _errorsRpcError2 = _interopRequireDefault(_errorsRpcError);

/**
 * Prepare rpc request.
 */

function request(method, params, suffix) {
  var now = process.hrtime();

  return {
    id: now[0] * 1e9 + now[1] + (suffix !== undefined ? '-' + suffix : ''),
    method: method,
    params: params
  };
}

/**
 * Parse rpc response.
 */

function parse(response, body, options) {
  // Body => '<html>'
  if (typeof body === 'string' && response.statusCode !== 200) {
    throw new _errorsRpcError2['default'](response.statusCode);
  }

  // Body => batch response
  if (Array.isArray(body)) {
    if (options.headers) {
      return [body, response.headers];
    }

    return body;
  }

  if (body.error === null) {
    if (options.headers) {
      return [body.result, response.headers];
    }

    return body.result;
  }

  throw new _errorsRpcError2['default'](body.error.code, body.error.message || 'An error occurred while processing the RPC call to bitcoind');
}