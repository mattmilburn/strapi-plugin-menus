/**
 * Recursively loop to return a nested list of child items.
 */

import { getChildren, sortByOrder } from './';

const getDescendants = ( parentId, items, nested = false ) => {
  const results = [];
  const children = getChildren( parentId, items );

  children.forEach( child => {
    const descendants = getDescendants( child.id, items, nested );

    // Maybe return a nested list of parents and children.
    if ( nested ) {
      results.push( {
        ...child,
        children: descendants,
      } );

      return;
    }

    // Otherwise, return a flat list of descendants.
    results.push( child );
    descendants.forEach( descendant => results.push( descendant ) );
  } );

  return sortByOrder( results );
};

export default getDescendants;
