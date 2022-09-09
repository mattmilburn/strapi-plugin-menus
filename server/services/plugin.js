'use strict';

const { get, without } = require( 'lodash' );

const config = require( '../config' );
const { UID_MENU, UID_MENU_ITEM } = require( '../constants' );
const { pluginId } = require( '../utils' );

module.exports = ( { strapi } ) => ( {
  async getConfig() {
    const data = await strapi.config.get( `plugin.${pluginId}`, config.default );

    return data;
  },

  async getSchema() {
    const contentTypes = strapi.plugin( 'content-manager' ).service( 'content-types' );
    const menuModel = strapi.getModel( UID_MENU );
    const menuItemModel = strapi.getModel( UID_MENU_ITEM );
    const menuItemConfig = await contentTypes.findConfiguration( menuItemModel );

    // Determine custom relation fields, if any.
    const editItemRelations = get( menuItemConfig, 'layouts.editRelations', [] );
    const customItemRelations = without( editItemRelations, 'parent', 'root_menu' );

    // For the `MenuItem` schema, we're going to append extra metadata for custom
    // relations to more easily provide their necessary config on the frontend.
    const menuItemAttributes = await customItemRelations.reduce( async ( prevPromise, name ) => {
      const acc = await prevPromise;
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
      const mainFieldType = get( relationModel, `attributes.${mainFieldName}.type` );

      const metadata = {
        relationType: attr.relation,
        targetModel: attr.target,
        mainField: {
          name: mainFieldName,
          schema: {
            type: mainFieldType,
          },
        },
        queryInfos: {
          containsKey: '',
          defaultParams: {},
          endPoint: `/menus/relations/${name}`,
          shouldDisplayRelationLink: true,
          paramsToKeep: [],
        },
      };

      return {
        ...acc,
        [ name ]: {
          ...attr,
          metadata,
        }
      };
    }, Promise.resolve( menuItemModel.attributes ) );

    return {
      menu: menuModel.attributes,
      menuItem: menuItemAttributes,
    };
  },
} );
