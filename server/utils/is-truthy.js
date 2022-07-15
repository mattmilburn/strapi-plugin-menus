'use strict';

/**
 * @NOTE - We do not include `null` as falsey here so query string params can
 * evaluate as truthy when only their key is set.
 */

const isTruthy = value => {
  return ! [
    undefined,
    false,
    'false',
    '',
    0,
  ].includes( value );
};

module.exports = isTruthy;
