'use strict';

const { UID_MENU } = require( '../constants' );

module.exports = ( { strapi } ) => ( {
  async checkAvailability( slug, id ) {
    const params = {
      filters: { slug },
    };

    // Optionally exclude by the ID so we don't check the menu against itself.
    if ( id ) {
      params.filters.id = { $ne: id };
    }

    const entity = await strapi.entityService.findMany( UID_MENU, params );

    return ! entity.length;
  },
} );
