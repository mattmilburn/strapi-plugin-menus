'use strict';

const flattenDeep = require( 'lodash/flattenDeep' );
const get = require( 'lodash/get' );
const omit = require( 'lodash/omit' );
const { createCoreService } = require('@strapi/strapi').factories;

const { UID_MENU_ITEM } = require( '../constants' );
const { sanitizeEntity } = require( '../utils' );

module.exports = createCoreService( UID_MENU_ITEM, ( { strapi } ) => ( {
  async bulkCreateOrUpdate( items, menuId ) {
    const itemsToCreate = items.filter( item => ! item.id || `${item.id}`.includes( 'create' ) );
    let itemsToUpdate = items.filter( item => Number.isInteger( item.id ) );

    /**
     * @NOTE - Recursive logic CAN work to create parent items before its descendants
     * so the parent IDs can be used in the next create operation. But managing
     * the promise state is too complex. That is what led to assigning parent
     * relations AFTER the items are created.
     */

    // Create array of promises containing create operations.
    let createdItems = await Promise.all( itemsToCreate.map( item => {
      // If this item has a parent being created in the same operation, we will
      // omit that parent for now. It will be properly assigned after this.
      const sanitizedItem = sanitizeEntity(
        item.parent && typeof item.parent.id === 'string'
          ? omit( item, 'parent' )
          : item
      );

      return strapi.entityService.create( UID_MENU_ITEM, {
        data: {
          ...sanitizedItem,
          root_menu: menuId,
        }
      } ).then( data => {
        // After the data is returned, we attach `createId` to remember it's
        // original ID so in the next operation we can assign it as the parent
        // of other menu items which don't know the correct ID until after creation.
        return {
          ...data,
          createId: item.id,
        };
      } );
    } ) );

    // For items created in this operation whose parent was also created in this
    // same operation, we add those items into `itemsToUpdate` so they have their
    // parent relations properly assigned.
    itemsToCreate.forEach( item => {
      const hasNewParent = item.parent && typeof item.parent.id === 'string';

      if ( hasNewParent ) {
        const createdItem = createdItems.find( _item => _item.createId === item.id );
        const createdParent = createdItems.find( _item => _item.createId === item.parent.id );

        if ( ! createdItem || ! createdParent ) {
          return;
        }

        itemsToUpdate.push( {
          id: createdItem.id,
          parent: {
            id: createdParent.id,
          },
        } );
      }
    } );

    // Create array of promises containing update operations.
    const updatedItems = await Promise.all( itemsToUpdate.map( async item => {
      const sanitizedItem = sanitizeEntity( item );

      return await strapi.entityService.update( UID_MENU_ITEM, item.id, {
        data: sanitizedItem,
      } );
    } ) );

    // Return created and updated items, but remove duplicates from created items
    // because those duplicates were used to assign parent relations.
    return [
      ...createdItems.filter( item => ! updatedItems.find( _item => _item.id === item.id ) ),
      ...updatedItems,
    ];
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

    const itemsToDelete = flattenDeep( deleteLoop( lastItemsToDelete ) ).reverse();

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

  async getPopulation() {
    const { layouts } = await getService( 'config' ).get();
    const customLayouts = get( layouts, 'menuItem', {} );
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
