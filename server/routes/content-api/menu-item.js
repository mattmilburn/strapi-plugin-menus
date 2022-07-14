'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/items',
    handler: 'menu-item.find',
  },
  {
    method: 'GET',
    path: '/items/:id',
    handler: 'menu-item.findOne',
  },
  {
    method: 'POST',
    path: '/items',
    handler: 'menu-item.create',
  },
  {
    method: 'PUT',
    path: '/items/:id',
    handler: 'menu-item.update',
  },
  {
    method: 'DELETE',
    path: '/items/:id',
    handler: 'menu-item.delete',
  },
];
