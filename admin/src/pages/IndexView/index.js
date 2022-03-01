import React, { memo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DynamicTable, useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { Box, Button, useNotifyAT } from '@strapi/design-system';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Plus } from '@strapi/icons';

import { api, getTrad, pluginId } from '../../utils';
import { CreateModal, Layout, MenuRows } from '../../components';

import formLayout from './form-layout';
import formSchema from './form-schema';

const QUERY_KEY = 'menus-index';

const IndexView = () => {
  const { formatMessage } = useIntl();
  const { push } = useHistory();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  const [ activeModal, setActiveModal ] = useState( false );

  const { status, data } = useQuery( QUERY_KEY, () => api.get( null, { populate: false } ), {
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
  const rowCount = ( data?.menus?.length ?? 0 ) + 1;

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
  ];

  /**
   * @TODO - This primary action currently does not render when the `DynamicTable`
   * passes the `action` prop through to `EmptyStateLayout`. No idea why.
   */
  const primaryAction = (
    <Button
      onClick={ () => setActiveModal( true ) }
      startIcon={ <Plus /> }
      size="L"
    >
      { formatMessage( {
        id: getTrad( 'ui.create.menu' ),
        defaultMessage: 'Create menu',
      } ) }
    </Button>
  );

  return (
    <Layout
      isLoading={ isLoading }
      title={ formatMessage( {
        id: getTrad( 'index.header.title' ),
        defaultMessage: 'Menu Manager',
      } ) }
    >
      <HeaderLayout
        title={ formatMessage( {
          id: getTrad( 'index.header.title' ),
          defaultMessage: 'Menu Manager',
        } ) }
        subtitle={ formatMessage( {
          id: getTrad( 'index.header.subtitle' ),
          defaultMessage: 'Customize the structure of menus and menu items',
        } ) }
        primaryAction={ primaryAction }
      />
      <ContentLayout>
        <Box paddingBottom={ 10 }>
          <DynamicTable
            contentType="Menus"
            isLoading={ isLoading }
            headers={ !! data?.menus?.length ? tableHeaders : [] }
            rows={ data?.menus }
            action={ primaryAction }
            onConfirmDelete={ onConfirmDelete }
          >
            <MenuRows
              menus={ data?.menus }
              onClickClone={ id => push( `/plugins/${pluginId}/clone/${id}` ) }
              onClickEdit={ id => push( `/plugins/${pluginId}/edit/${id}` ) }
            />
          </DynamicTable>
        </Box>
      </ContentLayout>
      { activeModal && (
        <CreateModal
          fields={ formLayout.menu }
          onClose={ () => setActiveModal( false ) }
          invalidateQueries={ QUERY_KEY }
          schema={ formSchema }
        />
      ) }
    </Layout>
  );
};

export default memo( IndexView );
