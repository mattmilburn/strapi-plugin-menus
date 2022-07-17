import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { onRowClick, stopPropagation } from '@strapi/helper-plugin';
import { Badge, Box, Flex, IconButton, Typography } from '@strapi/design-system';
import { Tbody, Tr, Td } from '@strapi/design-system/Table';
import { Duplicate, Pencil, Trash } from '@strapi/icons';

import { getTrad } from '../../utils';

const MenuRows = ( { rows, onClickClone, onClickDelete, onClickEdit } ) => {
  const { formatMessage } = useIntl();

  return (
    <Tbody>
      { rows.map( row => (
        <Tr
          key={ row.id }
          { ...onRowClick( {
            fn: () => onClickEdit( row.id ),
          } ) }
        >
          <Td>
            <Typography textColor="neutral800">{ row.attributes.title }</Typography>
          </Td>
          <Td>
            <Typography textColor="neutral800">{ row.attributes.slug }</Typography>
          </Td>
          <Td>
            <Badge>{ row.attributes.items.length }</Badge>{ ' ' }
            <Typography textColor="neutral800">
              { formatMessage(
                {
                  id: getTrad( 'ui.items' ),
                  defaultMessage: '{number, plural, =0 {items} one {item} other {items}}',
                },
                { number: row.attributes.items.length }
              ) }
            </Typography>
          </Td>
          <Td>
            <Flex justifyContent="end">
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickEdit( row.id ) }
                  label={ formatMessage( { id: getTrad( 'ui.edit' ), defaultMessage: 'Edit' } ) }
                  icon={ <Pencil /> }
                  noBorder
                />
              </Box>
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickClone( row.id ) }
                  label={ formatMessage( { id: getTrad( 'ui.clone' ), defaultMessage: 'Clone' } ) }
                  icon={ <Duplicate /> }
                  noBorder
                />
              </Box>
              <Box paddingLeft={ 1 } { ...stopPropagation }>
                <IconButton
                  onClick={ () => onClickDelete( row.id ) }
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
  rows: PropTypes.arrayOf(
    PropTypes.shape( {
      id: PropTypes.number,
      attributes: PropTypes.shape( {
        id: PropTypes.number,
        title: PropTypes.string,
        slug: PropTypes.string,
        items: PropTypes.array,
      } ),
    } )
  ),
  onClickClone: PropTypes.func,
  onClickDelete: PropTypes.func,
  onClickEdit: PropTypes.func,
};

export default MenuRows;
