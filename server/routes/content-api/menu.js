'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'plugin::menus.menu.find',
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'plugin::menus.menu.findOne',
  },
  {
    method: 'POST',
    path: '/',
    handler: 'plugin::menus.menu.create',
  },
  {
    method: 'PUT',
    path: '/:id',
    handler: 'plugin::menus.menu.update',
  },
  {
    method: 'DELETE',
    path: '/:id',
    handler: 'plugin::menus.menu.delete',
  },
];
