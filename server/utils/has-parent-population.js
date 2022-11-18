'use strict';

const get = require( 'lodash/get' );
const has = require( 'lodash/has' );

const hasParentPopulation = params => {
  const populate = get( params, 'populate' );

  // Array population.
  if ( Array.isArray( populate ) ) {
    return populate.includes( 'items.parent' );
  }

  const itemsPopulate = get( populate, 'items.populate' );

  // Object with array population.
  if ( Array.isArray( itemsPopulate ) ) {
    return itemsPopulate.includes( 'parent' );
  }

  return has( itemsPopulate, 'parent' );
};

module.exports = hasParentPopulation;
