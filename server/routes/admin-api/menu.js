'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/config',
    handler: 'plugin::menus.menu.config',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/',
    handler: 'plugin::menus.menu.find',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'plugin::menus.menu.findOne',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/',
    handler: 'plugin::menus.menu.create',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'PUT',
    path: '/:id',
    handler: 'plugin::menus.menu.update',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'DELETE',
    path: '/:id',
    handler: 'plugin::menus.menu.delete',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
