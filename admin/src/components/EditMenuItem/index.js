import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useFormikContext } from 'formik';
import { Box, Stack } from '@strapi/design-system';
import { Tab, Tabs, TabPanel, TabPanels } from '@strapi/design-system/Tabs';

import { getTrad, menuItemProps, serializeFields } from '../../utils';
import { FormLayout, Section } from '../';

import { StyledTabGroup } from './styled';

const EditMenuItem = ( { data, fields, customLayouts } ) => {
  const { formatMessage } = useIntl();
  const { errors, values } = useFormikContext();
  const fieldIndex = values.items.findIndex( item => item.id === data.id );
  const hasError = !! ( errors?.items && errors.items[ fieldIndex ] );

  if ( ! fieldIndex && fieldIndex !== 0 ) {
    return null;
  }

  const mainFields = serializeFields( 'items', fieldIndex, fields );

  return (
    <StyledTabGroup
      id="menu-item-tabs"
      variant="simple"
      label={ formatMessage( {
        id: getTrad( 'edit.tabs.title' ),
        defaultMessage: 'Menu item settings',
      } ) }
    >
      <Tabs>
        <Tab variant="simple" hasError={ hasError }>
          { formatMessage( {
            id: getTrad( 'edit.tabs.title.link' ),
            defaultMessage: 'Link',
          } ) }
        </Tab>
        { customLayouts && Object.keys( customLayouts ).map( ( label, i ) => (
          <Tab variant="simple" key={ i }>{ label }</Tab>
        ) ) }
      </Tabs>
      <TabPanels style={ { position: 'relative' } }>
        <TabPanel>
          <Box padding={ 6 } background="neutral0" borderRadius="0 0 4px 4px">

            <Stack spacing={ 6 }>
              <FormLayout fields={ mainFields } />
            </Stack>

          </Box>
        </TabPanel>
        { customLayouts && Object.keys( customLayouts ).map( ( key, i ) => {
          const customFields = serializeFields( 'items', fieldIndex, customLayouts[ key ] );

          return (
            <TabPanel key={ i }>
              <Box padding={ 6 } background="neutral0" borderRadius="0 0 4px 4px">

                <Stack spacing={ 6 }>
                  <FormLayout fields={ customFields } />
                </Stack>

              </Box>
            </TabPanel>
          );
        } ) }
      </TabPanels>
    </StyledTabGroup>
  );
};

EditMenuItem.defaultProps = {
  customLayouts: {
    edit: {},
  },
};

EditMenuItem.propTypes = {
  customLayouts: PropTypes.object,
  data: menuItemProps.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditMenuItem;
