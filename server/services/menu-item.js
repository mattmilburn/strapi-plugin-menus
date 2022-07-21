'use strict';

const { flattenDeep } = require( 'lodash' );
const { createCoreService } = require('@strapi/strapi').factories;

const { UID_MENU_ITEM } = require( '../constants' );
const { sanitizeEntity } = require( '../utils' );

module.exports = createCoreService( UID_MENU_ITEM, ( { strapi } ) => ( {
  async bulkCreateOrUpdate( items, menuId ) {
    const itemsToUpdate = items.filter( item => Number.isInteger( item.id ) );
    const itemsToCreate = items.filter( item => `${item.id}`.includes( 'create' ) );

    // Maybe create root menu items before others.
    const firstRootItemsToCreate = itemsToCreate.filter( item => ! item.parent );

    // If there are no root items to create, maybe start with items that already
    // have an existing parent.
    const firstChildItemsToCreate = itemsToCreate.filter( item => item.parent && typeof item.parent.id !== 'string' );

    const firstItemsToCreate = [
      ...firstRootItemsToCreate,
      ...firstChildItemsToCreate,
    ];

    // If a parent AND child item are being created in the same save operation,
    // we need to ensure that the parent is created before the child by returning
    // promises that chain together additional promises to create descendants.
    const createLoop = _items => {
      return _items.map( async item => {
        const sanitizedItem = sanitizeEntity( item );
        const createdItem = await strapi.entityService.create( UID_MENU_ITEM, {
          data: {
            ...sanitizedItem,
            root_menu: menuId,
          },
        } );

        // If this item has children that also need to be created, keep the loop going.
        const nextItems = itemsToCreate
          .filter( _item => _item.parent && _item.parent.id === item.id )
          .map( _item => ( {
            ..._item,
            parent: {
              id: createdItem.id,
            }
          } ) );

        if ( nextItems.length ) {
          const nextCreatedItems = createLoop( nextItems );

          return [
            createdItem,
            ...nextCreatedItems,
          ];
        }

        return createdItem;
      } );
    };

    // Create arrays of promises that will handle create/update operations in order.
    const promisedItemsToCreate = createLoop( firstItemsToCreate );

    const promisedItemsToUpdate = itemsToUpdate.map( async item => {
      const sanitizedItem = sanitizeEntity( item );

      return await strapi.entityService.update( UID_MENU_ITEM, item.id, {
        data: sanitizedItem,
      } );
    } );

    return await Promise.all( [
      ...promisedItemsToCreate,
      ...promisedItemsToUpdate,
    ] );
  },

  async bulkDelete( items ) {
    // Maybe delete parent menu items after their children.
    let lastItemsToDelete = items.filter( item => {
      return ! item.parent || ! items.find( _item => item.parent.id === _item.id );
    } );

    // If there are no parent items to delete, freely delete all given items.
    if ( ! lastItemsToDelete.length ) {
      lastItemsToDelete = items;
    }

    // If a parent AND child item are being deleted in the same delete operation,
    // we need to ensure that the parent is deleted after the descendants by
    // putting a list of IDs in the proper order for deletion.
    const deleteLoop = _items => {
      return _items.map( item => {
        const children = items.filter( _item => _item.parent && _item.parent.id === item.id );

        if ( children.length ) {
          return [
            item.id,
            ...deleteLoop( children ),
          ];
        }

        return item.id;
      } );
    };

    let itemsToDelete = deleteLoop( lastItemsToDelete );
    itemsToDelete = flattenDeep( itemsToDelete ).reverse();

    return await strapi.entityService.deleteMany( UID_MENU_ITEM, {
      filters: {
        id: itemsToDelete,
      },
    } );
  },

  async findByRootMenu( menuId ) {
    const menuItems = await strapi.entityService.findMany( UID_MENU_ITEM, {
      filters: {
        root_menu: { id: menuId },
      },
    } );

    return menuItems;
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
        const relationPopulation = getService( 'menu-item' ).getRelationPopulation( input.name );

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
    const menuItemModel = strapi.getModel( UID_MENU_ITEM );
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
} ) );
