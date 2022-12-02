'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/relations/:model/:targetField',
    handler: 'relations.findAvailable',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
  {
    method: 'GET',
    path: '/relations/:model/:id/:targetField',
    handler: 'relations.findExisting',
    config: {
      policies: [ 'admin::isAuthenticatedAdmin' ],
    },
  },
];
