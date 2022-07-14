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
  {
    method: 'POST',
    path: '/',
    handler: 'menu.create',
  },
  {
    method: 'PUT',
    path: '/:id',
    handler: 'menu.update',
  },
  {
    method: 'DELETE',
    path: '/:id',
    handler: 'menu.delete',
  },
];
