'use strict';

const removeParentData = items => items.reduce( ( acc, item ) => {
  delete item.parent;

  item.children = removeParentData( item.children );

  return [
    ...acc,
    item,
  ];
}, [] );

module.exports = removeParentData;
