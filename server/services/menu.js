'use strict';

const { get, pick } = require( 'lodash' );
const { createCoreService } = require('@strapi/strapi').factories;

const config = require( '../config' );
const { getService, isTruthy, sanitizeEntity } = require( '../utils' );

module.exports = createCoreService( 'plugin::menus.menu', ( { strapi } ) => ( {
  async find( params ) {
    const { results, pagination } = await super.find( params );

    /**
     * @TODO - Handle optional nesting here.
     */

    return { results, pagination };
  },

  async findOne( entityId, params ) {
    const result = await super.findOne( entityId, params );

    /**
     * @TODO - Handle optional nesting here.
     */

    return result;
  },

  //////////////////////////////////////////////////////////////////////////////

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

  async getPopulation( name ) {
    const { layouts } = await getService( 'plugin' ).getConfig();
    const customLayouts = get( layouts, name, {} );
    const fields = Object.values( customLayouts ).flat();

    const population = fields.reduce( ( acc, { input } ) => {
      if ( ! input ) {
        return acc;
      }

      // Shallow populate media relations.
      if ( input.type === 'media' ) {
        return {
          ...acc,
          [ input.name ]: true,
        };
      }

      // Maybe deep populate media relations.
      if ( input.type === 'relation' ) {
        const relationPopulation = getService( 'menu' ).getRelationPopulation( input.name );

        return {
          ...acc,
          [ input.name ]: relationPopulation,
        };
      }

      return acc;
    }, {} );

    return population;
  },

  getRelationPopulation( field ) {
    const menuItemModel = strapi.getModel( 'plugin::menus.menu-item' );
    const attr = menuItemModel.attributes[ field ];

    if ( ! attr ) {
      return true;
    }

    const targetModel = strapi.getModel( attr.target );

    if ( ! targetModel ) {
      return true;
    }

    const attrs = sanitizeEntity( targetModel.attributes );

    // Get list of relational field names.
    const relations = Object.keys( attrs ).filter( key => {
      const { type } = attrs[ key ];

      return type === 'media' || type === 'relation';
    } );

    if ( ! relations.length ) {
      return true;
    }

    // Build population object.
    const populate = relations.reduce( ( acc, relation ) => {
      return {
        ...acc,
        [ relation ]: true,
      };
    }, {} );

    return { populate };
  },

  async getMenu( value, field = 'id' ) {
    const fieldsToPopulate = await this.getPopulation( 'menuItem' );

    const menu = await strapi.query( 'plugin::menus.menu' ).findOne( {
      where: {
        [ field ]: value,
      },
      populate: {
        items: {
          populate: {
            ...fieldsToPopulate,
            parent: {
              select: [ 'id' ],
            },
          },
        },
      },
    } );

    return menu;
  },

  async getMenus( populate = true ) {
    const params = {
      orderBy: {
        title: 'ASC',
      },
    };

    if ( isTruthy( populate ) ) {
      const fieldsToPopulate = await this.getPopulation( 'menuItem' );

      params.populate = {
        items: {
          populate: {
            ...fieldsToPopulate,
            parent: {
              select: [ 'id' ],
            },
          },
        },
      };
    } else {
      params.populate = {
        items: true,
      };
    }

    const menus = await strapi.query( 'plugin::menus.menu' ).findMany( params );

    return menus;
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
    const itemsToDelete = await getService( 'menu-item' ).getMenuItemsByRootMenu( id );

    if ( itemsToDelete.length ) {
      await getService( 'menu-item' ).bulkDeleteMenuItems( itemsToDelete );
    }

    // Finally, delete the menu.
    const menu = await strapi.query( 'plugin::menus.menu' ).delete( {
      where: { id },
    } );

    return menu;
  },
} ) );
