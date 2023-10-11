import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { onRowClick, stopPropagation, useQueryParams } from '@strapi/helper-plugin';
import { Badge } from '@strapi/design-system/Badge';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { IconButton } from '@strapi/design-system/IconButton';
import { Typography } from '@strapi/design-system/Typography';
import { Tbody, Tr, Td } from '@strapi/design-system/Table';
import Duplicate from '@strapi/icons/Duplicate';
import Pencil from '@strapi/icons/Pencil';
import Trash from '@strapi/icons/Trash';

import { getTrad } from '../../utils';

const MenuRows = ({ data, onClickClone, onClickDelete, onClickEdit }) => {
  const { formatMessage } = useIntl();
  const [{ query }] = useQueryParams();
  let rows = [...data];

  // Maybe sort rows.
  if (query?.sort) {
    const [sortKey, sortOrder] = query.sort.split(':');

    rows = data.sort((a, b) => {
      const compare = a.attributes[sortKey].localeCompare(b.attributes[sortKey]);

      return sortOrder === 'ASC' ? compare : -compare;
    });
  }

  return (
    <Tbody>
      {rows.map((row) => (
        <Tr
          key={row.id}
          {...onRowClick({
            fn: () => onClickEdit(row.id),
          })}
        >
          <Td>
            <Typography textColor="neutral800">{row.attributes.title}</Typography>
          </Td>
          <Td>
            <Typography textColor="neutral800">{row.attributes.slug}</Typography>
          </Td>
          <Td>
            <Badge>{get(row, 'attributes.items.data.length', 0)}</Badge>{' '}
            <Typography textColor="neutral800">
              {formatMessage(
                {
                  id: getTrad('ui.items'),
                  defaultMessage: '{number, plural, =0 {items} one {item} other {items}}',
                },
                { number: get(row, 'attributes.items.data.length', 0) }
              )}
            </Typography>
          </Td>
          <Td>
            <Flex justifyContent="end">
              <Box paddingLeft={1} {...stopPropagation}>
                <IconButton
                  onClick={() => onClickEdit(row.id)}
                  label={formatMessage({ id: getTrad('ui.edit'), defaultMessage: 'Edit' })}
                  icon={<Pencil />}
                  noBorder
                />
              </Box>
              <Box paddingLeft={1} {...stopPropagation}>
                <IconButton
                  onClick={() => onClickClone(row.id)}
                  label={formatMessage({ id: getTrad('ui.clone'), defaultMessage: 'Clone' })}
                  icon={<Duplicate />}
                  noBorder
                />
              </Box>
              <Box paddingLeft={1} {...stopPropagation}>
                <IconButton
                  onClick={() => onClickDelete(row.id)}
                  label={formatMessage({ id: getTrad('ui.delete'), defaultMessage: 'Delete' })}
                  icon={<Trash />}
                  noBorder
                />
              </Box>
            </Flex>
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
};

MenuRows.defaultProps = {
  onClickClone: () => {},
  onClickDelete: () => {},
  onClickEdit: () => {},
};

MenuRows.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      attributes: PropTypes.shape({
        title: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        items: PropTypes.shape({
          data: PropTypes.array.isRequired,
        }).isRequired,
      }),
    })
  ),
  onClickClone: PropTypes.func,
  onClickDelete: PropTypes.func,
  onClickEdit: PropTypes.func,
};

export default MenuRows;
