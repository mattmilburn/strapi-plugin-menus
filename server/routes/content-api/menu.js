'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'menu.find',
  },
  {
    method: 'GET',
    path: '/:slug',
    handler: 'menu.findOne',
  },
];
