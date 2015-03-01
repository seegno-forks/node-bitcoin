
/**
 * Module dependencies.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _standardError = require('standard-error');

var _standardError2 = _interopRequireDefault(_standardError);

/**
 * Export `StandardError` class.
 */

var StandardError = (function (_BaseError) {
  _inherits(StandardError, _BaseError);

  function StandardError() {
    _classCallCheck(this, StandardError);

    _BaseError.apply(this, arguments);
  }

  return StandardError;
})(_standardError2['default']);

exports['default'] = StandardError;
module.exports = exports['default'];