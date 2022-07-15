'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'menu.find',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'menu.findOne',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'POST',
    path: '/',
    handler: 'menu.create',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'PUT',
    path: '/:id',
    handler: 'menu.update',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'DELETE',
    path: '/:id',
    handler: 'menu.delete',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'menu.config',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'POST',
    path: '/relations/:targetField',
    handler: 'menu.findRelations',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
];
