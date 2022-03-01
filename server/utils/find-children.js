'use strict';

const sortByOrder = require( './sort-by-order' );

const findChildren = ( items, id ) => {
  const results = [];
  const children = items.filter( _item => _item.parent && _item.parent.id === id );

  children.forEach( child => {
    results.push( {
      ...child,
      children: findChildren( items, child.id ),
    } );
  } );

  return sortByOrder( results );
};

module.exports = findChildren;
