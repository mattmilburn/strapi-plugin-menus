'use strict';

const { get } = require( 'lodash' );

const getNestedParams = params => ( {
  ...params,
  populate: {
    ...get( params, 'populate', {} ),
    items: {
      populate: {
        ...get( params, 'populate.items.populate', {} ),
        parent: true,
      },
    },
  },
} );

module.exports = getNestedParams;
