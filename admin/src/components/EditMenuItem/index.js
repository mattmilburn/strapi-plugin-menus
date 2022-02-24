import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useFormikContext } from 'formik';
import { Box, Stack } from '@strapi/design-system';
import { Tab, Tabs, TabPanel, TabPanels } from '@strapi/design-system/Tabs';

import { getTrad, menuItemProps } from '../../utils';
import { FormLayout, Section } from '../';

import { StyledTabGroup } from './styled';

const EditMenuItem = ( { data, fields } ) => {
  const { formatMessage } = useIntl();
  const { errors, values } = useFormikContext();
  const fieldIndex = values.items.findIndex( item => item.id === data.id );
  const hasSettingsError = !! ( errors?.items && errors.items[ fieldIndex ] );

  if ( ! fieldIndex && fieldIndex !== 0 ) {
    return null;
  }

  const indexedFields = fields.map( field => ( {
    ...field,
    input: {
      ...field.input,
      name: field.input.name.replace( '{index}', fieldIndex ),
    },
  } ) );

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
        <Tab variant="simple" hasError={ hasSettingsError }>
          { formatMessage( {
            id: 'edit.tabs.title.link',
            defaultMessage: 'Link',
          } ) }
        </Tab>
        <Tab variant="simple">
          { formatMessage( {
            id: 'edit.tabs.title.advanced',
            defaultMessage: 'Advanced',
          } ) }
        </Tab>
      </Tabs>
      <TabPanels style={ { position: 'relative' } }>
        <TabPanel>
          <Box padding={ 6 } background="neutral0" borderRadius="0 0 4px 4px">

            <Stack size={ 6 }>
              <FormLayout fields={ indexedFields } />
            </Stack>

          </Box>
        </TabPanel>
        <TabPanel>
          <Box padding={ 6 } background="neutral0" borderRadius="0 0 4px 4px">

            <p style={ { fontStyle: 'italic' } }>Additional UI options coming soon!</p>

          </Box>
        </TabPanel>
      </TabPanels>
    </StyledTabGroup>
  );
};

EditMenuItem.propTypes = {
  data: menuItemProps.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditMenuItem;
