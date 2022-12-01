import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Tab, Tabs, TabPanel, TabPanels } from '@strapi/design-system/Tabs';

import { FormLayout, Section } from '../';
import { useMenuData } from '../../hooks';
import {
  camelToTitle,
  getTrad,
  menuItemProps,
  serializeFields,
} from '../../utils';

import { StyledTabGroup } from './styled';

const EditMenuItem = ( { data, fields } ) => {
  const { formatMessage } = useIntl();
  const { errors, modifiedData } = useMenuData();

  const itemIndex = modifiedData.items.findIndex( item => item.id === data.id );
  const hasItemError = !! ( errors?.items && errors.items[ itemIndex ] );

  const hasTabError = key => {
    if ( ! hasItemError ) {
      return false;
    }

    const errorFieldKeys = Object.keys( errors.items[ itemIndex ] );
    const tabFieldKeys = fields[ key ].map( field => field?.input?.name );
    const hasError = errorFieldKeys.some( name => tabFieldKeys.includes( name ) );

    return hasError;
  };

  if ( ! itemIndex && itemIndex !== 0 ) {
    return null;
  }

  return (
    <Box
      background="neutral0"
      borderRadius="4px"
      padding={ 6 }
      shadow="filterShadow"
    >
      <Typography variant="delta">
        { formatMessage( {
          id: getTrad( 'edit.tabs.title' ),
          defaultMessage: 'Edit item',
        } ) }
      </Typography>
      <StyledTabGroup
        id="menu-item-tabs"
        variant="simple"
        label={ formatMessage( {
          id: getTrad( 'edit.tabs.title' ),
          defaultMessage: 'Edit item',
        } ) }
      >
        <Tabs variant="simple">
          { Object.keys( fields ).map( ( key, i ) => (
            <Tab variant="simple" key={ i } hasError={ hasTabError( key ) }>
              { formatMessage( {
                id: getTrad( `edit.tabs.title.${key}` ),
                defaultMessage: camelToTitle( key ),
              } ) }
            </Tab>
          ) ) }
        </Tabs>
        <TabPanels style={ { position: 'relative' } }>
          { Object.keys( fields ).map( ( key, i ) => {
            const itemFields = serializeFields( 'items', itemIndex, fields[ key ] );

            return (
              <TabPanel key={ i }>
                <Box paddingTop={ 6 }>
                  <Stack spacing={ 6 }>
                    <FormLayout fields={ itemFields } />
                  </Stack>
                </Box>
              </TabPanel>
            );
          } ) }
        </TabPanels>
      </StyledTabGroup>
    </Box>
  );
};

EditMenuItem.propTypes = {
  data: menuItemProps.isRequired,
  fields: PropTypes.object.isRequired,
};

export default EditMenuItem;
