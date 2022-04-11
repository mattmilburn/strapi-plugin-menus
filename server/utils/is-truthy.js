'use strict';

const isTruthy = value => {
  return value !== undefined
    && value !== 'false'
    && value !== ''
    && value !== 0;
};

module.exports = isTruthy;
