import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { useFormikContext } from 'formik';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import set from 'lodash/set';
import uniqBy from 'lodash/uniqBy';
import uniqueId from 'lodash/uniqueId';

import { MenuDataContext } from '../../contexts';
import {
  getFieldsByType,
  getRelationValue,
  menuProps,
  pluginId,
} from '../../utils';
import {
  defaultItem,
  getChildren,
  getDescendants,
  sortByOrder,
} from './utils';

const MenuDataProvider = ( { children, isCloningEntry, isCreatingEntry, menu } ) => {
  const { formatMessage } = useIntl();
  const { config, schema } = useSelector( state => state[ `${pluginId}_config` ] );
  const { maxDepth } = config;
  const {
    errors,
    handleChange,
    initialValues,
    isSubmitting,
    setFieldValue,
    setValues,
    values,
  } = useFormikContext();
  const [ initialData, setInitialData ] = useState( initialValues );
  const [ prevModifiedData, setPrevModifiedData ] = useState( null );
  const [ activeMenuItem, setActiveMenuItem ] = useState( null );

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

  const dirty = useMemo( () => {
    return ! isEqual( initialData, values );
  }, [ initialData, values ] );

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

  const connectRelation = ( { name, value, toOneRelation } ) => {
    if ( toOneRelation ) {
      setFieldValue( name, [ value ] );
    } else {
      const modifiedDataRelations = getRelationValue( values, name );
      const newRelations = [ ...modifiedDataRelations, value ];

      setFieldValue( name, newRelations );
    }
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

  const disconnectRelation = ( { name, id } ) => {
    const modifiedDataRelations = getRelationValue( values, name );
    const newRelations = modifiedDataRelations.filter( relation => relation.id !== id );

    setFieldValue( name, newRelations );
  };

  const loadRelation = ( { target: { name, value } } ) => {
    const initialDataRelations = getRelationValue( initialData, name );
    const modifiedDataRelations = getRelationValue( values, name );
    const newInitialRelations = uniqBy( [ ...value, ...initialDataRelations ], 'id' );
    const newRelations = uniqBy( [ ...value, ...modifiedDataRelations ], 'id' );

    setFieldValue( name, newRelations );

    // We set the value in `initialData` as well so it stays in sync with
    // `modifiedData` to allow the correct dirty UI state to render.
    let newInitialData = { ...initialData };
    set( newInitialData, name, newInitialRelations );
    setInitialData( newInitialData );
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
  }, [ activeMenuItem, values?.items ] );

  useEffect( () => {
    // Keep track of previously modified data so relations data does not need to be
    // re-fetched after saving.
    if ( isSubmitting ) {
      setPrevModifiedData( values );
    }
  }, [ isSubmitting ] );

  useEffect( () => {
    if ( ! prevModifiedData ) {
      return;
    }

    const newInitialData = { ...initialValues };

    const relationFields = getFieldsByType(
      schema.menuItem,
      [ 'relation' ],
      [ 'parent', 'root_menu', 'createdBy', 'updatedBy' ]
    );

    // Keep any relations data that was loaded for menu items in the edit view
    // state so we avoid reloading them after saving.
    newInitialData.items = newInitialData.items.map( item => {
      const prevItem = prevModifiedData.items.find( _item => _item.id === item.id );

      if ( ! prevItem ) {
        return item;
      }

      let resyncedItem = { ...item };

      relationFields.forEach( field => {
        resyncedItem[ field ] = prevItem[ field ];
      } );

      return resyncedItem;
    } );

    setInitialData( newInitialData );
    setValues( newInitialData );
  }, [ initialValues ] );

  const providerProps = {
    activeMenuItem,
    addMenuItem,
    connectRelation,
    deleteMenuItem,
    dirty,
    disconnectRelation,
    errors,
    handleChange,
    initialData,
    isCloningEntry,
    isCreatingEntry,
    items,
    loadRelation,
    maxDepth,
    modifiedData: values,
    moveMenuItem,
    schema,
    setActiveMenuItem,
  };

  return (
    <MenuDataContext.Provider value={ providerProps }>
      { children( providerProps ) }
      { ! isSubmitting && (
        <Prompt
          when={ dirty }
          message={ formatMessage( { id: 'global.prompt.unsaved' } ) }
        />
      ) }
    </MenuDataContext.Provider>
  );
};

MenuDataProvider.defaultProps = {
  isCreatingEntry: false,
  isCloningEntry: false,
};

MenuDataProvider.propTypes = {
  children: PropTypes.func.isRequired,
  isCloningEntry: PropTypes.bool.isRequired,
  isCreatingEntry: PropTypes.bool.isRequired,
  menu: menuProps,
};

export default MenuDataProvider;
