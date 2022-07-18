'use strict';

const { get } = require( 'lodash' );

const getNestedParams = params => ( {
  ...params,
  populate: {
    ...get( params, 'populate', {} ),
    items: {
      ...get( params, 'populate.items', {} ),
      parent: true,
    },
  },
} );

module.exports = getNestedParams;
