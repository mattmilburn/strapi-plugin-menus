'use strict';

const config = require('./config');
const menu = require('./menu');
const menuItem = require('./menu-item');
const uid = require('./uid');

module.exports = {
  config,
  menu,
  'menu-item': menuItem,
  uid,
};
