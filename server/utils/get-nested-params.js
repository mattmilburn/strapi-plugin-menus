'use strict';

const { uniq } = require( 'lodash' );

const getNestedParams = params => ( {
  ...params,
  populate: uniq( [
    ...params.populate,
    'items',
    'items.parent',
  ] ),
} );

module.exports = getNestedParams;
