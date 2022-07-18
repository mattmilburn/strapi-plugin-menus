'use strict';

const sortByOrder = require( './sort-by-order' );

const findChildren = ( items, id ) => {
  const results = [];
  const children = items.filter( item => item.parent && item.parent.id === id );

  children.forEach( child => {
    results.push( {
      ...child,
      children: findChildren( items, child.id ),
    } );
  } );

  return sortByOrder( results );
};

module.exports = findChildren;
