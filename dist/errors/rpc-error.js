
/**
 * Module dependencies.
 */

'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _http = require('http');

var _standardError = require('./standard-error');

var _standardError2 = _interopRequireDefault(_standardError);

/**
 * Export `RpcError` class.
 */

var RpcError = (function (_StandardError) {
  _inherits(RpcError, _StandardError);

  function RpcError(code, msg, props) {
    _classCallCheck(this, RpcError);

    if (typeof code != 'number') {
      throw new TypeError('Non-numeric HTTP code ' + JSON.stringify(code));
    }

    if (typeof msg == 'object' && msg !== null) {
      props = msg;
      msg = null;
    }

    _StandardError.call(this, msg || _http.STATUS_CODES[code], props);

    this.code = code;
  }

  RpcError.prototype.toString = function toString() {
    return this.name + ': ' + this.code + ' ' + this.message;
  };

  _createClass(RpcError, [{
    key: 'status',
    get: function get() {
      return this.code;
    },
    set: function set(value) {
      Object.defineProperty(this, 'status', {
        value: value,
        configurable: true,
        enumerable: true,
        writable: true
      });
    }
  }]);

  return RpcError;
})(_standardError2['default']);

exports['default'] = RpcError;
module.exports = exports['default'];