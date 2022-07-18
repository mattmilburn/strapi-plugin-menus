'use strict';

const { get, has, uniq } = require( 'lodash' );

const getNestedParams = params => {
  const populateParent = [ 'items', 'items.parent' ];
  const populate = get( params, 'populate' );

  /**
   * @TODO - One day this will need to be refactored when relation fields are
   * supported on the Menu data. Currently only MenuItem supports custom relations.
   */

  // Top-level population.
  if ( populate === '*' ) {
    return {
      ...params,
      populate: populateParent,
    };
  }

  // Array population.
  if ( Array.isArray( populate ) ) {
    return {
      ...params,
      populate: uniq( [
        ...populate,
        ...populateParent,
      ] ),
    };
  }

  const itemsPopulate = get( populate, 'items.populate' );

  // Object population.
  if ( itemsPopulate ) {
    // Top-level population.
    if ( itemsPopulate === '*' ) {
      return {
        ...params,
        populate: {
          ...populate,
          items: {
            populate: {
              parent: true,
            },
          },
        },
      };
    }

    // Array population.
    if ( Array.isArray( itemsPopulate ) ) {
      return {
        ...params,
        populate: {
          ...populate,
          items: {
            populate: uniq( [
              ...itemsPopulate,
              ...populateParent,
            ] ),
          },
        },
      };
    }

    // Object population.
    return {
      ...params,
      populate: {
        ...populate,
        items: {
          populate: {
            ...itemsPopulate,
            parent: true,
          },
        },
      },
    };
  }

  return params;
};

module.exports = getNestedParams;
