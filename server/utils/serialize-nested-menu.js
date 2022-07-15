'use strict';

const findChildren = require( './find-children' );
const sortByOrder = require( './sort-by-order' );
const removeParentData = require( './remove-parent-data' );

const serializeNestedMenu = ( menu, keepParentData ) => {
  // Do nothing if there are no items to serialize.
  if ( ! menu.items || ! menu.items.length ) {
    return menu;
  }

  const rootItems = menu.items.filter( _item => ! _item.parent );

  // Assign ordered and nested items to root items.
  const nestedItems = rootItems.reduce( ( acc, item ) => {
    const descendants = findChildren( menu.items, item.id );

    const rootItem = {
      ...item,
      children: descendants,
    };

    return [ ...acc, rootItem ];
  }, [] );

  const items = keepParentData ? nestedItems : removeParentData( nestedItems );

  return {
    ...menu,
    items: sortByOrder( items ),
  };
};

module.exports = serializeNestedMenu;
