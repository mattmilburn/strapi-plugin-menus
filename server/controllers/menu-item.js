'use strict';

const { getService } = require( '../utils' );

module.exports = {
  async find( ctx ) {
    const menuItems = await getService( 'menu-item' ).getMenuItems();

    ctx.send( { menuItems } );
  },

  async findOne( ctx ) {
    const { id } = ctx.request.params;

    const menuItem = await getService( 'menu-item' ).getMenuItem( id );

    if ( ! menuItem ) {
      return ctx.notFound();
    }

    ctx.send( { menuItem } );
  },
};
