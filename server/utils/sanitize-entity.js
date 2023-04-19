'use strict';

const omit = require( 'lodash/omit' );

const sanitizeEntity = entity => omit( entity, [
  'id', // @NOTE - Remove id because this function is only used in create/update methods.
  'created_at',
  'created_by',
  'createdAt',
  'createdBy',
  'updated_at',
  'updated_by',
  'updatedAt',
  'updatedBy',
] );

module.exports = sanitizeEntity;
