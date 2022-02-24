'use strict';

const menu = require( './menu' );

module.exports = {
  type: 'admin',
  routes: [
    ...menu,
  ],
};
