'use strict';

const { get, pick } = require( 'lodash' );

const config = require( '../config' );
const { getService, pluginId, sanitizeEntity } = require( '../utils' );

module.exports = ( { strapi } ) => ( {
  async getConfig() {
    const data = await strapi.config.get( `plugin.${pluginId}`, config.default );

    return data;
  },

  async checkAvailability( slug, id ) {
    const params = {
      where: { slug },
    };

    // Optionally exclude by the ID so we don't check the menu against itself.
    if ( id ) {
      params.filters = {
        $not: { id },
      };
    }

    const menu = await strapi.query( 'plugin::menus.menu' ).findOne( params );

    return ! menu;
  },

  async getMenus() {
    const menus = await strapi.query( 'plugin::menus.menu' ).findMany( {
      orderBy: {
        title: 'ASC',
      },
    } );

    return menus;
  },

  async getMenu( id ) {
    const menu = await strapi.query( 'plugin::menus.menu' ).findOne( {
      where: { id },
      populate: {
        items: {
          populate: true,
        },
      },
    } );

    return menu;
  },

  async createMenu( data ) {
    const menuData = pick( data, [ 'title', 'slug' ], {} );
    const menuItemsData = get( data, 'items', [] );

    // Create new menu.
    const menu = await strapi.query( 'plugin::menus.menu' ).create( { data: menuData } );

    // Maybe create menu items (should only happen when cloning).
    if ( menuItemsData ) {
      await getService( 'menu-item' ).bulkCreateOrUpdateMenuItems( menuItemsData, menu.id );
    }

    return menu;
  },

  async updateMenu( id, data, prevData ) {
    const menuData = pick( data, [ 'title', 'slug' ], {} );
    const menuItemsData = get( data, 'items', [] );
    const prevItemsData = get( prevData, 'items', [] );

    // Compare new `items` to existing `items` to determine which can be deleted.
    const itemsToDelete = prevItemsData.filter( item => {
      return ! menuItemsData.find( _item => _item.id === item.id );
    } );

    // First, delete menu items that were removed from the menu.
    if ( itemsToDelete.length ) {
      await getService( 'menu-item' ).bulkDeleteMenuItems( itemsToDelete );
    }

    // Next, create or update menu items before updating the menu.
    await getService( 'menu-item' ).bulkCreateOrUpdateMenuItems( menuItemsData, id );

    // Finally, update the menu.
    const menu = await strapi.query( 'plugin::menus.menu' ).update( {
      where: { id },
      data: menuData,
    } );

    return menu;
  },

  async deleteMenu( id ) {
    // First, delete menu items belonging to the menu that will be deleted.
    const itemsToDelete = await getService( 'menu-item' ).getMenuItems( id );

    if ( itemsToDelete.length ) {
      await getService( 'menu-item' ).bulkDeleteMenuItems( itemsToDelete );
    }

    // Finally, delete the menu.
    const menu = await strapi.query( 'plugin::menus.menu' ).delete( {
      where: { id },
    } );

    return menu;
  },
} );
