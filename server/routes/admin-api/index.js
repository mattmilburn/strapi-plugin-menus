'use strict';

const menu = require( './menu' );
const relations = require( './relations' );

module.exports = {
  type: 'admin',
  routes: [
    ...relations,
    ...menu,
  ],
};
