'use strict';

const menu = require('./menu');
const menuItem = require('./menu-item');

module.exports = {
  type: 'content-api',
  routes: [...menu, ...menuItem],
};
