import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Formik } from 'formik';
import { get, pick, uniqueId } from 'lodash';
import { Form, useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { Box, Button, Link, Stack, useNotifyAT } from '@strapi/design-system';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { ArrowLeft, Check } from '@strapi/icons';

import {
  FormLayout,
  Layout,
  MenuItemsManager,
  MenuManagerProvider,
  Section,
} from '../../components';
import {
  api,
  getTrad,
  pluginId,
  sanitizeEntity,
  sanitizeFormData,
} from '../../utils';

import formLayout from './form-layout';
import formSchema from './form-schema';

const QUERY_KEY = 'edit-menu';

const EditView = () => {
  const { id } = useParams();
  const { push } = useHistory();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  const isCloning = pathname.split( '/' ).includes( 'clone' );

  const headerTitle = isCloning ?
    formatMessage( {
      id: getTrad( 'clone.header.title' ),
      defaultMessage: 'Clone menu',
    } ) :
    formatMessage( {
      id: getTrad( 'edit.header.title' ),
      defaultMessage: 'Edit menu',
    } );

  const { status, data } = useQuery( QUERY_KEY, () => api.get( id ), {
    enabled: !! id,
    onSuccess: data => {
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

  const submitMutation = useMutation( body => {
    // Maybe clone this menu with sanitized data.
    if ( isCloning ) {
      const menuData = pick( body, [ 'title', 'slug' ], {} );
      const menuItemsData = body.items.map( item => ( {
        id: uniqueId( 'create' ),
        ...sanitizeEntity( item ),
      } ) );

      const clonedBody = {
        ...menuData,
        items: menuItemsData,
      };

      return api.postAction( clonedBody );
    }

    // If not cloning, update this menu.
    return api.putAction( id, body );
  }, {
    refetchActive: true,
    onSuccess: async () => {
      await queryClient.invalidateQueries( QUERY_KEY );

      toggleNotification( {
        type: 'success',
        message: {
          id: getTrad( 'ui.saved' ),
          defaultMessage: 'Saved',
        },
      } );
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
    onSettled: () => {
      unlockApp();
    },
  } );

  const onSubmit = async ( body, { setErrors } ) => {
    lockApp();

    try {
      const sanitizedMenuData = sanitizeFormData( body, formLayout.menu );
      const sanitizedMenuItemsData = get( body, 'items', [] ).map( item => {
        return sanitizeFormData( item, formLayout.menuItem );
      } );

      const res = await submitMutation.mutateAsync( {
        ...sanitizedMenuData,
        items: sanitizedMenuItemsData,
      } );

      // If we just cloned a page, we need to redirect to the new edit page.
      if ( isCloning && res?.data?.menu ) {
        push( `/plugins/${pluginId}/edit/${res.data.menu.id}` );
      }
    } catch ( err ) {
      unlockApp();

      const errorDetails = err?.response?.data?.error?.details;

      // Maybe set error details.
      if ( errorDetails ) {
        setErrors( errorDetails );
      }
    }
  };

  return (
    <Layout
      isLoading={ status !== 'success' }
      title={ headerTitle }
    >
      <Formik
        onSubmit={ onSubmit }
        initialValues={ data?.menu }
        validateOnChange={ false }
        validationSchema={ formSchema }
        enableReinitialize
      >
        { ( { dirty, handleSubmit, isSubmitting } ) => {
          return (
            <Form onSubmit={ handleSubmit }>
              <HeaderLayout
                title={ headerTitle }
                navigationAction={
                  <Link startIcon={ <ArrowLeft /> } to={ `/plugins/${pluginId}` }>
                    { formatMessage( {
                      id: getTrad( 'ui.goBack' ),
                      defaultMessage: 'Go back',
                    } ) }
                  </Link>
                }
                primaryAction={
                  <Button
                    type="submit"
                    disabled={ ! dirty || isSubmitting }
                    loading={ isSubmitting }
                    startIcon={ <Check /> }
                    size="L"
                  >
                    { formatMessage( {
                      id: getTrad( 'ui.save' ),
                      defaultMessage: 'Save',
                    } ) }
                  </Button>
                }
              />
              <ContentLayout>
                <Box paddingBottom={ 10 }>
                  <Stack spacing={ 8 }>
                    <Section>
                      <FormLayout fields={ formLayout.menu } />
                    </Section>
                    <MenuManagerProvider menu={ data?.menu }>
                      <MenuItemsManager fields={ formLayout.menuItem } />
                    </MenuManagerProvider>
                  </Stack>
                </Box>
              </ContentLayout>
            </Form>
          );
        } }
      </Formik>
    </Layout>
  );
};

export default EditView;
