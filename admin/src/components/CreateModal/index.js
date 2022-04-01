import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import { Form, useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { Button, Stack } from '@strapi/design-system';
import { Breadcrumbs, Crumb } from '@strapi/design-system/Breadcrumbs';
import { ModalLayout, ModalHeader, ModalFooter, ModalBody } from '@strapi/design-system/ModalLayout';

import { FormLayout, MenuDataProvider } from '../';
import { api, getTrad, pluginId, sanitizeFormData } from '../../utils';

const CreateModal = ( {
  fields,
  invalidateQueries,
  onClose,
  schema,
} ) => {
  const { push } = useHistory();
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  const initialValues = {
    title: '',
    slug: '',
  };

  const headerTitle = formatMessage( {
    id: getTrad( 'create.header.title' ),
    defaultMessage: 'Create new menu',
  } );

  const submitMutation = useMutation( body => api.postAction( body ), {
    onSuccess: async ( { data } ) => {
      if ( !! invalidateQueries ) {
        await queryClient.invalidateQueries( invalidateQueries );
      }

      toggleNotification( {
        type: 'success',
        message: {
          id: getTrad( 'ui.created' ),
          defaultMessage: 'Created',
        },
      } );

      if ( data?.menu?.id ) {
        push( `/plugins/${pluginId}/edit/${data.menu.id}` );
      }
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
      const sanitizedMenuFields = sanitizeFormData( body, fields );
      await submitMutation.mutateAsync( sanitizedMenuFields );

      // Close modal.
      onClose();
    } catch ( err ) {
      unlockApp();

      const errorDetails = err?.response?.data?.error?.details;

      // Maybe set error details.
      if ( errorDetails ) {
        return setErrors( errorDetails );
      }
    }
  };

  return (
    <ModalLayout onClose={ onClose } labelledBy="title">
      <ModalHeader>
        <Breadcrumbs label={ headerTitle }>
          <Crumb>{ headerTitle }</Crumb>
        </Breadcrumbs>
      </ModalHeader>
      <Formik
        onSubmit={ onSubmit }
        initialValues={ initialValues  }
        validateOnChange={ false }
        validationSchema={ schema }
      >
        { ( { handleSubmit, isSubmitting } ) => {
          return (
            <Form onSubmit={ handleSubmit }>
              <ModalBody>
                <Stack spacing={ 6 }>
                  <MenuDataProvider isCreatingEntry={ true }>
                    <FormLayout fields={ fields } />
                  </MenuDataProvider>
                </Stack>
              </ModalBody>
              <ModalFooter
                startActions={
                  <Button type="button" variant="tertiary" onClick={ onClose }>
                    { formatMessage( {
                      id: getTrad( 'ui.cancel' ),
                      defaultMessage: 'Cancel',
                    } ) }
                  </Button>
                }
                endActions={
                  <Button type="submit" loading={ isSubmitting }>
                    { formatMessage( {
                      id: getTrad( 'ui.create.menu' ),
                      defaultMessage: 'Create menu',
                    } ) }
                  </Button>
                }
              />
            </Form>
          );
        } }
      </Formik>
    </ModalLayout>
  );
};

CreateModal.propTypes = {
  fields: PropTypes.array.isRequired,
  invalidateQueries: PropTypes.oneOfType( [
    PropTypes.string,
    PropTypes.arrayOf( PropTypes.string ),
  ] ),
  onClose: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
};

export default CreateModal;
