'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'menu.find',
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'menu.findOne',
  },
];
