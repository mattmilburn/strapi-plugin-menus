import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';

import { MenuDataContext } from '../../contexts';
import { menuProps, pluginId } from '../../utils';
import {
  defaultItem,
  getChildren,
  getDescendants,
  sortByOrder,
} from './utils';

const MenuDataProvider = ( { children, isCreatingEntry, menu } ) => {
  const dispatch = useDispatch();
  const [ activeMenuItem, setActiveMenuItem ] = useState( null );
  const { config, schema } = useSelector( state => state[ `${pluginId}_config` ] );
  const { maxDepth } = config;
  const {
    errors,
    handleChange,
    initialValues,
    setFieldValue,
    setValues,
    values,
  } = useFormikContext();

  const items = useMemo( () => {
    if ( ! values?.items ) {
      return [];
    }

    const rootItems = values.items.filter( item => ! item.parent );

    // Recursively add descendant items to top-level items.
    const nestedItems = rootItems.map( item => ( {
      ...item,
      children: getDescendants( item.id, values.items, true ),
    } ) );

    return sortByOrder( nestedItems );
  }, [ values?.items ] );

  const addMenuItem = parentId => {
    const order = getChildren( parentId, values.items ).length;

    // Using the `create` prefix with the ID will help us know which items need
    // to be created on the backend when this data is saved.
    const newItem = {
      ...defaultItem,
      order,
      id: uniqueId( 'create' ),
      root_menu: { id: menu?.id },
      parent: parentId ? { id: parentId } : null,
    };

    setValues( {
      ...values,
      items: [ ...values.items, newItem ],
    } );

    setActiveMenuItem( newItem );
  };

  const addRelation = ( { target: { name, value } } ) => {
    if ( ! Array.isArray( value ) || ! value.length ) {
      return;
    }

    const currentRelations = get( values, name, [] );
    const newRelation = value[ 0 ].value;
    const newRelations = [
      ...currentRelations,
      newRelation,
    ];

    setFieldValue( name, newRelations );
  };

  const deleteMenuItem = id => {
    // Determine all items to delete, which includes it's descendants.
    const itemToDelete = values.items.find( item => item.id === id );
    const descendantsToDelete = getDescendants( id, values.items );

    // Create new list of items excluding all deleted items.
    let newItems = values.items.filter( item => {
      const isTarget = item.id === id;
      const isDescendant = descendantsToDelete.find( _item => _item.id === item.id );

      return ! isTarget && ! isDescendant;
    } );

    // Determine new ordering for siblings.
    const siblings = getChildren( itemToDelete?.parent?.id, newItems );
    const orderedSiblings = sortByOrder( siblings ).map( ( item, order ) => ( { ...item, order } ) );

    // Re-serialize items to keep their numbering sequential starting from 0 with their siblings.
    newItems = newItems.map( item => {
      const reorderedItem = orderedSiblings.find( _item => _item.id === item.id );

      return reorderedItem ?? item;
    } );

    setValues( {
      ...values,
      items: newItems,
    } );

    // Close edit panel if we are deleting the current active item.
    if ( activeMenuItem?.id === id ) {
      setActiveMenuItem( null );
    }
  };

  const moveMenuItem = ( id, direction ) => {
    const itemA = values.items.find( _item => _item.id === id );
    const siblings = getChildren( itemA?.parent?.id, values.items );
    const orderA = itemA.order;
    const orderB = orderA + direction;
    const itemB = siblings.find( item => item.order === orderB );

    if ( ! itemB ) {
      return;
    }

    const orderedItemA = { ...itemA, order: orderB };
    const orderedItemB = { ...itemB, order: orderA };

    // Switch the order values for items A and B.
    const orderedItems = values.items.map( item => {
      if ( item.id === itemA.id ) {
        return orderedItemA;
      }

      if ( item.id === itemB.id ) {
        return orderedItemB;
      }

      return item;
    } );

    setValues( {
      ...values,
      items: orderedItems,
    } );

    setActiveMenuItem( orderedItemA );
  };

  const moveRelation = () => {
    // This is a no-op in Strapi but we're keeping in place in case it gets used in the future.
  };

  const onRemoveRelation = keys => {
    const [ itemPath, fieldName, relationIndex ] = keys.split( '.' );
    const fieldPath = `${itemPath}.${fieldName}`;
    const indexToRemove = parseInt( relationIndex );
    const currentRelations = get( values, fieldPath, [] );
    const newRelations = currentRelations.filter( ( r, i ) => i !== indexToRemove );

    setFieldValue( fieldPath, newRelations );
  };

  useEffect( () => {
    if ( ! activeMenuItem || ! `${activeMenuItem.id}`.includes( 'create' ) ) {
      return;
    }

    // If active menu item is a new item and we just saved, find that newly
    // created item again and set it as active.
    const newActiveItem = get( values, 'items', [] ).find( ( { order, parent } ) => (
      order === activeMenuItem.order &&
      parent === activeMenuItem.parent
    ) );

    if ( newActiveItem ) {
      setActiveMenuItem( newActiveItem );
    }
  }, [ activeMenuItem, values ] );

  return (
    <MenuDataContext.Provider value={ {
      activeMenuItem,
      addMenuItem,
      addRelation,
      deleteMenuItem,
      errors,
      handleChange,
      initialData: initialValues,
      isCreatingEntry,
      items,
      maxDepth,
      modifiedData: values,
      moveMenuItem,
      moveRelation,
      onRemoveRelation,
      schema,
      setActiveMenuItem,
    } }>
      { children }
    </MenuDataContext.Provider>
  );
};

MenuDataProvider.defaultProps = {
  isCreatingEntry: false,
};

MenuDataProvider.propTypes = {
  children: PropTypes.node,
  isCreatingEntry: PropTypes.bool.isRequired,
  menu: menuProps,
};

export default MenuDataProvider;
