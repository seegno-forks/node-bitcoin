
/**
 * Module dependencies.
 */

import RpcError from './errors/rpc-error';

/**
 * Prepare rpc request.
 */

export function request(method, params, suffix) {
  const now = process.hrtime();

  return {
    id: now[0] * 1e9 + now[1] + (suffix !== undefined ? '-' + suffix : ''),
    method,
    params
  };
}

/**
 * Parse rpc response.
 */

export function parse(response, body, options) {
  // Body => '<html>'
  if (typeof body === 'string' && response.statusCode !== 200) {
    throw new RpcError(response.statusCode);
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

  throw new RpcError(body.error.code, body.error.message || 'An error occurred while processing the RPC call to bitcoind');
}
