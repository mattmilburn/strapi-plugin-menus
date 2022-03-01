'use strict';

const findChildren = require( './find-children' );
const sortByOrder = require( './sort-by-order' );

const serializeNestedMenu = menu => {
  const { items } = menu;

  // Do nothing if there are no items to serialize.
  if ( ! items || ! items.length ) {
    return menu;
  }

  const rootItems = items.filter( _item => ! _item.parent );

  // Assign ordered and nested items to root items.
  const nestedItems = rootItems.reduce( ( acc, item ) => {
    const descendants = findChildren( items, item.id );

    const rootItem = {
      ...item,
      children: descendants,
    };

    return [ ...acc, rootItem ];
  }, [] );

  return {
    ...menu,
    items: sortByOrder( nestedItems ),
  };
};

module.exports = serializeNestedMenu;
