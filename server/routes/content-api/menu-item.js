'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/items',
    handler: 'plugin::menus.menu-item.find',
  },
  {
    method: 'GET',
    path: '/items/:id',
    handler: 'plugin::menus.menu-item.findOne',
  },
  {
    method: 'POST',
    path: '/items',
    handler: 'plugin::menus.menu-item.create',
  },
  {
    method: 'PUT',
    path: '/items/:id',
    handler: 'plugin::menus.menu-item.update',
  },
  {
    method: 'DELETE',
    path: '/items/:id',
    handler: 'plugin::menus.menu-item.delete',
  },
];
