'use strict';

const { get, has, omit } = require( 'lodash' );

const sortByOrder = require( './sort-by-order' );

const getDescendants = ( items, parentId ) => {
  const results = [];
  const children = items.filter( item => get( item, 'attributes.parent.data.id' ) === parentId );

  children.forEach( child => {
    results.push( {
      ...child,
      attributes: {
        ...child.attributes,
        children: {
          data: getDescendants( items, child.id ),
        },
      },
    } );
  } );

  return sortByOrder( results );
};

const removeParentData = items => items.reduce( ( acc, item ) => {
  let sanitizedItem = omit( item, 'attributes.parent' );
  sanitizedItem.attributes.children.data = removeParentData( item.attributes.children.data );

  return [
    ...acc,
    sanitizedItem,
  ];
}, [] );

const serializeNestedMenu = ( data, keepParentData ) => {
  if ( Array.isArray( get( data, 'data' ) ) ) {
    return data.data.map( _data => serializeNestedMenu( _data, keepParentData ) );
  }

  const items = get( data, 'data.attributes.items.data', [] );

  // Do nothing if there are no items to serialize.
  if ( ! items.length ) {
    return data;
  }

  const rootItems = items.filter( item => ! has( item, 'attributes.parent.data.id' ) );

  // Assign ordered and nested items to root items.
  const nestedItems = rootItems.reduce( ( acc, item ) => {
    const rootItem = {
      ...item,
      attributes: {
        ...item.attributes,
        children: {
          data: getDescendants( items, item.id ),
        },
      },
    };

    return [ ...acc, rootItem ];
  }, [] );

  const sanitizedItems = ! keepParentData ? removeParentData( nestedItems ) : nestedItems;

  return {
    ...data,
    data: {
      ...data.data,
      attributes: {
        ...data.data.attributes,
        items: {
          data: sortByOrder( sanitizedItems ),
        },
      },
    },
  };
};

module.exports = serializeNestedMenu;
