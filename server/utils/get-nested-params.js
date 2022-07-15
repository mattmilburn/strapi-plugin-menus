'use strict';

const { get, uniq } = require( 'lodash' );

const getNestedParams = params => ( {
  ...params,
  populate: uniq( [
    ...get( params, 'populate', [] ),
    'items',
    'items.parent',
  ] ),
} );

module.exports = getNestedParams;
