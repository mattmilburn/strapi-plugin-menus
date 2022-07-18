import React, { memo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  DynamicTable,
  EmptyStateLayout,
  useNotification,
  useOverlayBlocker,
} from '@strapi/helper-plugin';
import { Box, Button, useNotifyAT } from '@strapi/design-system';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Plus } from '@strapi/icons';

import { api, getTrad, pluginId, pluginName } from '../../utils';
import { Layout, MenuRows } from '../../components';

const QUERY_KEY = 'menus-index';

const IndexView = ( { history } ) => {
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  const fetchParams = {
    populate: '*',
  };

  const { status, data } = useQuery( QUERY_KEY, () => api.get( null, fetchParams ), {
    onSuccess: () => {
      notifyStatus(
        formatMessage( {
          id: getTrad( 'ui.loaded' ),
          defaultMessage: 'Data has been loaded',
        } )
      );
    },
    onError: () => {
      toggleNotification( {
        type: 'warning',
        message: {
          id: getTrad( 'ui.error' ),
          defaultMessage: 'An error occured',
        },
      } );
    },
  } );

  const deleteMutation = useMutation( id => api.deleteAction( id ), {
    onSuccess: async () => {
      await queryClient.invalidateQueries( QUERY_KEY );

      toggleNotification( {
        type: 'success',
        message: {
          id: getTrad( 'ui.deleted.menu' ),
          defaultMessage: 'Menu has been deleted',
        },
      } );
    },
    onError: err => {
      if ( err?.response?.data?.data ) {
        toggleNotification( {
          type: 'warning',
          message: err.response.data.data,
        } );
      } else {
        toggleNotification( {
          type: 'warning',
          message: {
            id: getTrad( 'ui.error' ),
            defaultMessage: 'An error occured',
          },
        } );
      }
    },
    onSettled: () => {
      unlockApp();
    },
  } );

  const onConfirmDelete = async id => {
    lockApp();

    try {
      await deleteMutation.mutateAsync( id );
    } catch ( err ) {
      unlockApp();
    }
  }

  const isLoading = status !== 'success';
  const colCount = 3;
  const rowCount = ( data?.data?.length ?? 0 ) + 1;

  const tableHeaders = [
    {
      name: 'title',
      key: 'title',
      metadatas: {
        label: formatMessage( {
          id: getTrad( 'form.label.title' ),
          defaultMessage: 'Title',
        } ),
        sortable: true,
      },
    },
    {
      name: 'slug',
      key: 'slug',
      metadatas: {
        label: formatMessage( {
          id: getTrad( 'form.label.slug' ),
          defaultMessage: 'Slug',
        } ),
        sortable: true,
      },
    },
    {
      name: 'items',
      key: 'items',
      metadatas: {
        label: formatMessage( {
          id: getTrad( 'form.label.items' ),
          defaultMessage: 'Items',
        } ),
        sortable: false,
      },
    },
  ];

  /**
   * @TODO - This primary action currently does not render when the `DynamicTable`
   * passes the `action` prop through to `EmptyStateLayout`. No idea why.
   */
  const PrimaryAction = ( {
    size = 'L',
    variant = 'default',
  } ) => (
    <Button
      onClick={ () => history.push( `/plugins/${pluginId}/create` ) }
      startIcon={ <Plus /> }
      variant={ variant }
      size={ size }
    >
      { formatMessage( {
        id: getTrad( 'ui.create.menu' ),
        defaultMessage: 'Create new menu',
      } ) }
    </Button>
  );

  return (
    <Layout
      isLoading={ isLoading }
      title={ formatMessage( {
        id: getTrad( 'plugin.name' ),
        defaultMessage: pluginName,
      } ) }
    >
      <HeaderLayout
        title={ formatMessage( {
          id: getTrad( 'plugin.name' ),
          defaultMessage: pluginName,
        } ) }
        subtitle={ formatMessage( {
          id: getTrad( 'index.header.subtitle' ),
          defaultMessage: 'Customize the structure of menus and menu items',
        } ) }
        primaryAction={ <PrimaryAction /> }
      />
      <ContentLayout>
        <Box paddingBottom={ 10 }>
          { !! data?.data?.length ? (
            <DynamicTable
              contentType="Menus"
              isLoading={ isLoading }
              headers={ tableHeaders }
              rows={ data.data }
              action={ <PrimaryAction size="S" variant="secondary" /> }
              onConfirmDelete={ onConfirmDelete }
            >
              <MenuRows
                rows={ data.data }
                onClickClone={ id => history.push( `/plugins/${pluginId}/clone/${id}` ) }
                onClickEdit={ id => history.push( `/plugins/${pluginId}/edit/${id}` ) }
              />
            </DynamicTable>
          ) : (
            <EmptyStateLayout
              content={ {
                id: getTrad( 'index.state.empty' ),
                defaultMessage: 'No menus found',
              } }
              action={ <PrimaryAction size="S" variant="secondary" /> }
            />
          ) }
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo( IndexView );
