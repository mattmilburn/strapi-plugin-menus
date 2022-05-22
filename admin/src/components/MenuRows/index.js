import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { onRowClick, stopPropagation } from '@strapi/helper-plugin';
import { Badge, Box, Flex, IconButton, Typography } from '@strapi/design-system';
import { Tbody, Tr, Td } from '@strapi/design-system/Table';
import { Duplicate, Pencil, Trash } from '@strapi/icons';

import { getTrad } from '../../utils';

const MenuRows = ( { menus, onClickClone, onClickDelete, onClickEdit } ) => {
  const { formatMessage } = useIntl();

  return (
    <Tbody>
      { menus.map( menu => (
        <Tr
          key={ menu.id }
          { ...onRowClick( {
            fn: () => onClickEdit( menu.id ),
          } ) }
        >
          <Td>
            <Typography textColor="neutral800">{ menu.title }</Typography>
          </Td>
          <Td>
            <Typography textColor="neutral800">{ menu.slug }</Typography>
          </Td>
          <Td>
            <Badge>{ menu.items.length }</Badge>{ ' ' }
            <Typography textColor="neutral800">
              { formatMessage(
                {
                  id: getTrad( 'ui.items' ),
                  defaultMessage: '{number, plural, =0 {items} one {item} other {items}}',
                },
                { number: menu.items.length }
              ) }
            </Typography>
          </Td>
          <Td>
            <Flex justifyContent="end">
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickEdit( menu.id ) }
                  label={ formatMessage( { id: getTrad( 'ui.edit' ), defaultMessage: 'Edit' } ) }
                  icon={ <Pencil /> }
                  noBorder
                />
              </Box>
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickClone( menu.id ) }
                  label={ formatMessage( { id: getTrad( 'ui.clone' ), defaultMessage: 'Clone' } ) }
                  icon={ <Duplicate /> }
                  noBorder
                />
              </Box>
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickDelete( menu.id ) }
                  label={ formatMessage( { id: getTrad( 'ui.delete' ), defaultMessage: 'Delete' } ) }
                  icon={ <Trash /> }
                  noBorder
                />
              </Box>
            </Flex>
          </Td>
        </Tr>
      ) ) }
    </Tbody>
  );
};

MenuRows.defaultProps = {
  onClickClone: () => {},
  onClickDelete: () => {},
  onClickEdit: () => {},
};

MenuRows.propTypes = {
  menus: PropTypes.arrayOf(
    PropTypes.shape( {
      title: PropTypes.string,
      slug: PropTypes.string,
    } )
  ),
  onClickClone: PropTypes.func,
  onClickDelete: PropTypes.func,
  onClickEdit: PropTypes.func,
};

export default MenuRows;
