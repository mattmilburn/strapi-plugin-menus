'use strict';

const menu = require( './menu' );
const menuItem = require( './menu-item' );
const plugin = require( './plugin' );
const uid = require( './uid' );

module.exports = {
  menu,
  'menu-item': menuItem,
  plugin,
  uid,
};
