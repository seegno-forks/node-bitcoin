
/**
 * Module dependencies.
 */

import _ from 'lodash';

/**
 * Parse `help` bitcoin-cli output.
 */

export default function parse(help) {
  return _.chain(help.split('\n'))
    .reject((line) => line.startsWith('==') || !_.identity(line))
    .map((line) => (/^([a-z]+)/).exec(line)[1])
    .value();
}
