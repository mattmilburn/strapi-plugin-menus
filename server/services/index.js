'use strict';

const config = require('./config');
const documentation = require('./documentation');
const menu = require('./menu');
const menuItem = require('./menu-item');
const uid = require('./uid');

module.exports = {
  config,
  documentation,
  menu,
  'menu-item': menuItem,
  uid,
};
