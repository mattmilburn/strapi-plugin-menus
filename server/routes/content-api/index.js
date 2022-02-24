'use strict';

const menu = require( './menu' );

module.exports = {
  type: 'content-api',
  routes: [
    ...menu,
  ],
};
