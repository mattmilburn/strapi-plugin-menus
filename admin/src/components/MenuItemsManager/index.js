import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import FlipMove from 'react-flip-move';
import { EmptyStateLayout } from '@strapi/helper-plugin';
import { Button, Flex } from '@strapi/design-system';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { Plus, PlusCircle } from '@strapi/icons';

import { EditMenuItem, TreeMenu, TreeMenuItem } from '../';
import { useMenuData } from '../../hooks';
import { getTrad } from '../../utils';

import { AddButton } from './styled';

const MenuItemsManager = ( { fields } ) => {
  const { formatMessage } = useIntl();
  const [ activeLevel, setActiveLevel ] = useState( null );
  const {
    activeMenuItem,
    addMenuItem,
    deleteMenuItem,
    errors,
    items,
    maxDepth,
    modifiedData,
    moveMenuItem,
    setActiveMenuItem,
  } = useMenuData();

  const addItemLabel = formatMessage( {
    id: getTrad( 'ui.add.menuItem' ),
    defaultMessage: 'Add menu item',
  } );

  const renderItems = ( _items, level = 0 ) => {
    const parentId = _items[ 0 ]?.parent?.id;
    const maxDepthReached = ! maxDepth ? false : level + 1 >= maxDepth;

    const action = (
      <AddButton
        startIcon={ <PlusCircle /> }
        onClick={ () => addMenuItem( parentId ) }
        onMouseEnter={ () => setActiveLevel( level ) }
        onMouseLeave={ () => setActiveLevel( null )  }
      >
        { addItemLabel }
      </AddButton>
    );

    return (
      <TreeMenu action={ action } level={ level } activeLevel={ activeLevel }>
        { _items.map( ( item, i ) => {
          const siblings = modifiedData.items.filter( _item => _item?.parent?.id === item?.parent?.id );
          const itemIndex = modifiedData.items.findIndex( _item => _item.id === item.id );
          const hasErrors = !! ( errors?.items && errors.items[ itemIndex ] );
          const isActive = item.id === activeMenuItem?.id;

          return (
            <TreeMenuItem
              key={ item.id }
              data={ item }
              hasErrors={ hasErrors }
              isActive={ isActive }
              isFirst={ item.order === 0 }
              isLast={ item.order === siblings.length - 1 }
              isMaxDepth={ maxDepthReached }
              onAddSubmenu={ () => addMenuItem( item.id ) }
              onClick={ () => setActiveMenuItem( isActive ? null : item ) }
              onDelete={ () => deleteMenuItem( item.id ) }
              onMoveUp={ () => moveMenuItem( item.id, -1 ) }
              onMoveDown={ () => moveMenuItem( item.id, 1 ) }
            >
              { !! item?.children?.length && renderItems( item.children, level + 1 ) }
            </TreeMenuItem>
          );
        } ) }
      </TreeMenu>
    );
  };

  if ( ! items?.length ) {
    return (
      <EmptyStateLayout
        content={ {
          id: getTrad( 'edit.state.empty' ),
          defaultMessage: 'Add the first menu item',
        } }
        action={
          <Button
            onClick={ () => addMenuItem() }
            startIcon={ <Plus /> }
            variant="secondary"
            size="S"
          >
            { addItemLabel }
          </Button>
        }
      />
    );
  }

  return (
    <Grid gap={ 6 }>
      <GridItem col={ 6 } s={ 12 }>
        { renderItems( items ) }
      </GridItem>
      <GridItem col={ 6 } s={ 12 }>
        { activeMenuItem && (
          <EditMenuItem
            data={ activeMenuItem }
            fields={ fields }
          />
        ) }
      </GridItem>
    </Grid>
  );
};

MenuItemsManager.propTypes = {
  fields: PropTypes.object.isRequired,
};

export default MenuItemsManager;
