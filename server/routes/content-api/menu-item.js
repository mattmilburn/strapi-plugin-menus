'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'menu-item.find',
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'menu-item.findOne',
  },
];
