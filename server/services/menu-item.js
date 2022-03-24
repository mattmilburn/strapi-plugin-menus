'use strict';

const { flattenDeep } = require( 'lodash' );

const { sanitizeEntity } = require( '../utils' );

module.exports = ( { strapi } ) => ( {
  async getMenuItems( menuId ) {
    const menuItems = await strapi.query( 'plugin::menus.menu-item' ).findMany( {
      where: {
        root_menu: { id: menuId },
      },
      populate: true,
    } );

    return menuItems;
  },

  async bulkCreateOrUpdateMenuItems( items, menuId ) {
    const itemsToUpdate = items.filter( item => Number.isInteger( item.id ) );
    const itemsToCreate = items.filter( item => `${item.id}`.includes( 'create' ) );

    // Maybe create root menu items before others.
    let firstItemsToCreate = itemsToCreate.filter( item => ! item.parent );

    // If there are no root items to create, maybe start with items that already
    // have an existing parent.
    if ( itemsToCreate.length && ! firstItemsToCreate.length ) {
      firstItemsToCreate = itemsToCreate.filter( item => item.parent && typeof item.parent.id !== 'string' );
    }

    /**
     * @NOTE - The `createMany` method would be preferable here, but Strapi does
     * not currently support creating the relations within bulk operations while
     * single operation methods do support it, so we're looping to `create` items.
     *
     * @SEE - /packages/core/database/lib/entity-manager.js
     */

    // If a parent AND child item are being created in the same save operation,
    // we need to ensure that the parent is created before the child by returning
    // promises that chain together additional promises to create descendants.
    const createLoop = _items => {
      return _items.map( async item => {
        const sanitizedItem = sanitizeEntity( item );
        const createdItem = await strapi.query( 'plugin::menus.menu-item' ).create( {
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

      return await strapi.query( 'plugin::menus.menu-item' ).update( {
        where: { id: item.id },
        data: sanitizedItem,
      } );
    } );

    await Promise.all( [
      ...promisedItemsToCreate,
      ...promisedItemsToUpdate,
    ] );
  },

  async bulkDeleteMenuItems( items ) {
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

    await strapi.query( 'plugin::menus.menu-item' ).deleteMany( {
      where: {
        id: itemsToDelete,
      },
    } );
  },
} );
