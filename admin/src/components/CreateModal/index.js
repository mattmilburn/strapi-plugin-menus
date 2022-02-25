import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import { Form, useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { Button, Stack, useNotifyAT } from '@strapi/design-system';
import { Breadcrumbs, Crumb } from '@strapi/design-system/Breadcrumbs';
import { ModalLayout, ModalHeader, ModalFooter, ModalBody } from '@strapi/design-system/ModalLayout';

import { api, getTrad, pluginId } from '../../utils';
import { FormLayout } from '../';

const CreateModal = ( {
  fields,
  invalidateQueries,
  onClose,
  schema,
} ) => {
  const { push } = useHistory();
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
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
    refetchActive: true,
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
          id: 'ui.error',
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
      await submitMutation.mutateAsync( body );

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
                <Stack size={ 6 }>
                  <FormLayout fields={ fields } />
                </Stack>
              </ModalBody>
              <ModalFooter
                startActions={
                  <Button type="button" variant="tertiary" onClick={ onClose }>
                    { formatMessage( {
                      id: 'ui.cancel',
                      defaultMessage: 'Cancel',
                    } ) }
                  </Button>
                }
                endActions={
                  <Button type="submit" loading={ isSubmitting }>
                    { formatMessage( {
                      id: 'ui.create.menu',
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
