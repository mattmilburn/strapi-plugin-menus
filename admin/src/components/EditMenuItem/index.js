import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Box, Stack, Typography } from '@strapi/design-system';
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

  /**
   * @TODO - Refactor this so single tabs can have errors instead of the whole set.
   */
  const hasError = !! ( errors?.items && errors.items[ itemIndex ] );

  if ( ! itemIndex && itemIndex !== 0 ) {
    return null;
  }

  return (
    <Box padding={ 6 } background="neutral0" borderRadius="4px" shadow="filterShadow">
      <Typography variant="delta">Edit item</Typography>
      <StyledTabGroup
        id="menu-item-tabs"
        variant="simple"
        label={ formatMessage( {
          id: getTrad( 'edit.tabs.title' ),
          defaultMessage: 'Menu item settings',
        } ) }
      >
        <Tabs variant="simple">
          { Object.keys( fields ).map( ( key, i ) => (
            <Tab variant="simple" key={ i } hasError={ hasError }>
              { formatMessage( {
                id: key,
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
