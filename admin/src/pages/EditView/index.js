import React, { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import get from 'lodash/get';
import pick from 'lodash/pick';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import { Formik } from 'formik';
import { Form, useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { useNotifyAT } from '@strapi/design-system';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { Link } from '@strapi/design-system/Link';
import { Stack } from '@strapi/design-system/Stack';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import ArrowLeft from '@strapi/icons/ArrowLeft';
import Check from '@strapi/icons/Check';

const defaultValues = {
  title: '',
  slug: '',
  items: [],
};

import {
  FormLayout,
  Layout,
  MenuDataProvider,
  MenuItemsManager,
  Section,
} from '../../components';
import {
  api,
  getFieldsByType,
  getFieldsLayout,
  getTrad,
  pluginId,
  sanitizeEntity,
  sanitizeFormData,
  transformResponse,
} from '../../utils';

import formLayout from './form-layout';
import formSchema from './form-schema';

const CLONE_QUERY_KEY = 'menus-clone-{id}';
const CREATE_QUERY_KEY = 'menus-create';
const EDIT_QUERY_KEY = 'menus-edit-{id}';

const EditView = ( { history, location, match } ) => {
  const { id } = match.params;
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  // Get config and custom layouts.
  const { config, schema } = useSelector( state => state[ `${pluginId}_config` ] );
  const customLayouts = get( config, 'layouts.menuItem', {} );

  // Merge default fields layout with custom field layouts.
  const menuItemLayout = useMemo( () => {
    return getFieldsLayout( formLayout.menuItem, customLayouts, schema );
  }, [ customLayouts ] );
  const menuItemFields = Object.values( menuItemLayout ).flat();

  const isCreating = ! id;
  const isCloning = location.pathname.split( '/' ).includes( 'clone' );

  let headerTitle = formatMessage( {
    id: getTrad( 'edit.header.title' ),
    defaultMessage: 'Edit menu',
  } );

  let queryKey = EDIT_QUERY_KEY.replace( '{id}', id );

  // Set props based on `isCreating` or `isCloning`.
  if ( isCreating ) {
    headerTitle = formatMessage( {
      id: getTrad( 'create.header.title' ),
      defaultMessage: 'Create menu',
    } );

    queryKey = CREATE_QUERY_KEY;
  }

  if ( isCloning ) {
    headerTitle = formatMessage( {
      id: getTrad( 'clone.header.title' ),
      defaultMessage: 'Clone menu',
    } );

    queryKey = CLONE_QUERY_KEY.replace( '{id}', id );
  }

  const mediaFields = getFieldsByType( schema.menuItem, [ 'media' ] );
  const fetchParams = {
    populate: uniq( [
      'items',
      'items.parent',
      ...mediaFields.map( field => `items.${field}` ),
    ] ),
  };

  const { status, data } = useQuery( queryKey, () => api.get( id, fetchParams ), {
    enabled: ! isCreating,
    select: data => transformResponse( data ),
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

  const submitMutation = useMutation( body => {
    // Maybe clone this menu with sanitized data.
    if ( isCloning ) {
      const menuData = pick( body.data, [ 'title', 'slug' ], {} );
      const menuItemIdMap = body.data.items.map( item => ( {
        id: item.id,
        createId: uniqueId( 'create' ),
      } ) );
      const menuItemsData = body.data.items.map( item => {
        const createMap = menuItemIdMap.find( _item => _item.id === item.id );
        const parentMap = menuItemIdMap.find( _item => _item.id === item.parent?.id );

        const createId = createMap ? createMap.createId : null;
        const parent = parentMap ? { id: parentMap.createId } : null;

        return {
          ...sanitizeEntity( item ),
          id: createId,
          parent,
        };
      } );

      const clonedBody = {
        data: {
          ...menuData,
          items: menuItemsData,
        },
      };

      return api.postAction( clonedBody );
    }

    // Maybe submit a new menu.
    if ( isCreating ) {
      return api.postAction( body );
    }

    // If not creating or cloning, update this menu.
    return api.putAction( id, body );
  }, {
    refetchActive: true,
    onSuccess: async () => {
      await queryClient.invalidateQueries( queryKey );

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
      const sanitizedBody = sanitizeEntity( body );
      const sanitizedMenuData = sanitizeFormData( sanitizedBody, data, formLayout.menu, isCloning );
      const sanitizedMenuItemsData = get( sanitizedBody, 'items', [] ).map( item => {
        const sanitizedItem = sanitizeEntity( item );
        const prevItem = get( data, 'items', [] ).find( _item => _item.id === sanitizedItem.id );

        return sanitizeFormData( sanitizedItem, prevItem, menuItemFields, isCloning );
      } );

      const res = await submitMutation.mutateAsync( {
        data: {
          ...sanitizedMenuData,
          items: sanitizedMenuItemsData,
        },
      } );

      // If we just cloned a page, we need to redirect to the new edit page.
      if ( ( isCreating || isCloning ) && res?.data?.data?.id ) {
        history.push( `/plugins/${pluginId}/edit/${res.data.data.id}` );
      }
    } catch ( err ) {
      unlockApp();

      const errorDetails = err?.response?.data?.error?.details;

      // Maybe set error details.
      if ( errorDetails ) {
        setErrors( errorDetails );
      } else {
        console.error( err );
      }
    }
  };

  return (
    <Layout
      isLoading={ ! isCreating && status !== 'success' }
      title={ headerTitle }
    >
      <Formik
        onSubmit={ onSubmit }
        initialValues={ data ?? defaultValues }
        validateOnChange={ false }
        validationSchema={ formSchema }
        enableReinitialize
      >
        { ( { handleSubmit } ) => {
          return (
            <Form onSubmit={ handleSubmit }>
              <MenuDataProvider
                isCreatingEntry={ isCreating }
                isCloningEntry={ isCloning }
                menu={ data }
              >
                { ( { dirty, isSubmitting } ) => {
                  return (
                    <>
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
                              <MenuItemsManager fields={ menuItemLayout } />
                          </Stack>
                        </Box>
                      </ContentLayout>
                    </>
                  );
                } }
              </MenuDataProvider>
            </Form>
          );
        } }
      </Formik>
    </Layout>
  );
};

export default memo( EditView );
