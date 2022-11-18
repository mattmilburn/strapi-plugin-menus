'use strict';

const omit = require( 'lodash/omit' );

const sanitizeEntity = entity => omit( entity, [
  'id',
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
