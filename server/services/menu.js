'use strict';

const { get, omit, pick } = require( 'lodash' );

const config = require( '../config' );
const { getService, pluginId } = require( '../utils' );

module.exports = ( { strapi } ) => ( {
  async getConfig() {
    const data = await strapi.config.get( `plugin.${pluginId}`, config.default );

    return data;
  },

  async getSchema() {
    const contentTypes = strapi.plugin( 'content-manager' ).service( 'content-types' );
    const menuModel = strapi.getModel( 'plugin::menus.menu' );
    const menuItemModel = strapi.getModel( 'plugin::menus.menu-item' );
    const menuItemConfig = await contentTypes.findConfiguration( menuItemModel );

    // Determine custom relation fields, if any.
    const editItemRelations = get( menuItemConfig, 'layouts.editRelations', [] );
    const customItemRelations = omit( editItemRelations, [ 'parent', 'root_menu' ] );

    // For the `MenuItem` schema, we're going to append extra metadata for custom
    // relations to more easily provide their necessary config on the frontend.
    const menuItemAttributes = customItemRelations.reduce( ( acc, name ) => {
      const attr = acc[ name ];

      if ( ! attr || ! attr.target ) {
        return acc;
      }

      const relationModel = strapi.getModel( attr.target );

      if ( ! relationModel ) {
        return acc;
      }

      const relationConfig = await contentTypes.findConfiguration( relationModel );
      const mainFieldName = get( relationConfig, 'settings.mainField' );
      const mainFieldType = get( menuIteModel, `attributes.${mainFieldName}`, 'type' );

      const metadata = {
        relationType: attr.relation,
        targetModel: attr.target,
        mainField: {
          name: mainField,
          schema: {
            type: mainFieldType,
          },
        },
        queryInfos: {
          containsKey: '',
          defaultParams: {},
          endPoint: `menus/relations/${name}`,
          shouldDisplayRelationLink: true,
          paramsToKeep: [],
        },
      };

      return {
        ...acc,
        [ name ]: {
          ...attr,
          ...metadata,
        }
      };
    }, menuItemModel.attributes );

    return {
      menu: menuModel.attributes,
      menuItem: menuItemAttributes,
    };
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

  async getFieldsToPopulate( name ) {
    const { layouts } = await this.getConfig();
    const customLayouts = get( layouts, name, {} );
    const fields = Object.values( customLayouts ).flat();

    const fieldsToPopulate = fields.reduce( ( acc, { input } ) => {
      if ( input && ( input.type === 'media' || input.type === 'relation' ) ) {
        return {
          ...acc,
          [ input.name ]: true,
        };
      }

      return acc;
    }, {} );

    return fieldsToPopulate;
  },

  async getMenu( value, field = 'id' ) {
    const fieldsToPopulate = await this.getFieldsToPopulate( 'menuItem' );

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
    const fieldsToPopulate = await this.getFieldsToPopulate( 'menuItem' );

    const params = {
      orderBy: {
        title: 'ASC',
      },
    };

    if ( populate ) {
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
