import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import get from 'lodash/get';
import pick from 'lodash/pick';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import { Formik } from 'formik';
import {
  Form,
  useAPIErrorHandler,
  useFetchClient,
  useNotification,
  useOverlayBlocker,
} from '@strapi/helper-plugin';
import { useNotifyAT } from '@strapi/design-system';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { Link } from '@strapi/design-system/Link';
import { Stack } from '@strapi/design-system/Stack';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import ArrowLeft from '@strapi/icons/ArrowLeft';
import Check from '@strapi/icons/Check';

import { FormLayout, Layout, MenuDataProvider, MenuItemsManager, Section } from '../../components';
import { DRAG_ITEM_TYPES } from '../../constants';
import { DragLayer, RelationDragPreview } from '../../coreComponents';
import { usePluginConfig } from '../../hooks';
import {
  getFieldsByType,
  getFieldsLayout,
  getRequestUrl,
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

const defaultValues = {
  title: '',
  slug: '',
  items: [],
};

function renderDragLayerItem({ type, item }) {
  /**
   * Because a user may have multiple relations / dynamic zones / repeable fields in the same content type,
   * we append the fieldName for the item type to make them unique, however, we then want to extract that
   * first type to apply the correct preview.
   */
  const [actualType] = type.split('_');

  switch (actualType) {
    case DRAG_ITEM_TYPES.RELATION:
      return (
        <RelationDragPreview
          displayedValue={item.displayedValue}
          status={item.status}
          width={item.width}
        />
      );

    default:
      return null;
  }
}

const EditView = ({ history, location, match }) => {
  const { id } = match.params;
  const { formatAPIError } = useAPIErrorHandler();
  const fetchClient = useFetchClient();
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();

  // Get config and custom layouts.
  const {
    data: { config, schema },
  } = usePluginConfig();
  const customLayouts = get(config, 'layouts.menuItem', {});

  // Merge default fields layout with custom field layouts.
  const menuItemLayout = useMemo(() => {
    return getFieldsLayout(formLayout.menuItem, customLayouts, schema);
  }, [customLayouts, schema]);
  const menuItemFields = Object.values(menuItemLayout).flat();

  const mediaFields = useMemo(() => {
    return getFieldsByType(schema.menuItem, ['media']);
  }, [schema.menuItem]);

  const isCreating = !id;
  const isCloning = location.pathname.split('/').includes('clone');

  let headerTitle = formatMessage({
    id: getTrad('edit.header.title'),
    defaultMessage: 'Edit menu',
  });

  let queryKey = EDIT_QUERY_KEY.replace('{id}', id);

  // Set props based on `isCreating` or `isCloning`.
  if (isCreating) {
    headerTitle = formatMessage({
      id: getTrad('create.header.title'),
      defaultMessage: 'Create menu',
    });

    queryKey = CREATE_QUERY_KEY;
  }

  if (isCloning) {
    headerTitle = formatMessage({
      id: getTrad('clone.header.title'),
      defaultMessage: 'Clone menu',
    });

    queryKey = CLONE_QUERY_KEY.replace('{id}', id);
  }

  const getMenu = async (id) => {
    const { data } = await fetchClient.get(
      getRequestUrl(id, {
        populate: uniq(['items', 'items.parent', ...mediaFields.map((field) => `items.${field}`)]),
      })
    );

    return data;
  };

  const { status, data } = useQuery(queryKey, () => getMenu(id), {
    enabled: !isCreating,
    select: (data) => transformResponse(data),
    onSuccess: () => {
      notifyStatus(
        formatMessage({
          id: getTrad('ui.loaded'),
          defaultMessage: 'Data has been loaded',
        })
      );
    },
    onError: (err) => {
      toggleNotification({
        type: 'warning',
        message: formatAPIError(err),
      });
    },
  });

  const submitMutation = useMutation(
    (body) => {
      // Maybe clone this menu with sanitized data.
      if (isCloning) {
        const menuData = pick(body.data, ['title', 'slug'], {});
        const menuItemIdMap = body.data.items.map((item) => ({
          id: item.id,
          createId: uniqueId('create'),
        }));
        const menuItemsData = body.data.items.map((item) => {
          const createMap = menuItemIdMap.find((_item) => _item.id === item.id);
          const parentMap = menuItemIdMap.find((_item) => _item.id === item.parent?.id);

          const createId = createMap ? createMap.createId : null;
          const parent = parentMap ? { id: parentMap.createId } : null;

          return {
            ...sanitizeEntity(item),
            id: createId,
            parent,
          };
        });

        const clonedBody = {
          data: {
            ...menuData,
            items: menuItemsData,
          },
        };

        return fetchClient.post(getRequestUrl(), clonedBody);
      }

      // Maybe submit a new menu.
      if (isCreating) {
        return fetchClient.post(getRequestUrl(), body);
      }

      // If not creating or cloning, update this menu.
      return fetchClient.put(getRequestUrl(id), body);
    },
    {
      refetchActive: true,
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey);

        toggleNotification({
          type: 'success',
          message: {
            id: getTrad('ui.saved'),
            defaultMessage: 'Saved',
          },
        });
      },
      onError: (err) => {
        toggleNotification({
          type: 'warning',
          message: formatAPIError(err),
        });
      },
      onSettled: () => {
        unlockApp();
      },
    }
  );

  const onSubmit = async (body, { setErrors }) => {
    lockApp();

    try {
      const sanitizedBody = sanitizeEntity(body);
      const sanitizedMenuData = sanitizeFormData(sanitizedBody, data, formLayout.menu, isCloning);
      const sanitizedMenuItemsData = get(sanitizedBody, 'items', []).map((item) => {
        const sanitizedItem = sanitizeEntity(item);
        const prevItem = get(data, 'items', []).find((_item) => _item.id === sanitizedItem.id);

        return sanitizeFormData(sanitizedItem, prevItem, menuItemFields, isCloning);
      });

      const res = await submitMutation.mutateAsync({
        data: {
          ...sanitizedMenuData,
          items: sanitizedMenuItemsData,
        },
      });

      // If we just cloned a page, we need to redirect to the new edit page.
      if ((isCreating || isCloning) && res?.data?.data?.id) {
        history.push(`/plugins/${pluginId}/edit/${res.data.data.id}`);
      }
    } catch (err) {
      unlockApp();

      const errorDetails = err?.response?.data?.error?.details;

      // Maybe set error details.
      if (errorDetails) {
        setErrors(errorDetails);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Layout isLoading={!isCreating && status !== 'success'} title={headerTitle}>
      <DragLayer renderItem={renderDragLayerItem} />
      <Formik
        onSubmit={onSubmit}
        initialValues={data ?? defaultValues}
        validateOnChange={false}
        validationSchema={formSchema}
        enableReinitialize
      >
        {({ handleSubmit }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <MenuDataProvider isCreatingEntry={isCreating} isCloningEntry={isCloning} menu={data}>
                {({ dirty, isSubmitting }) => {
                  return (
                    <>
                      <HeaderLayout
                        title={headerTitle}
                        navigationAction={
                          <Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}`}>
                            {formatMessage({
                              id: getTrad('ui.goBack'),
                              defaultMessage: 'Go back',
                            })}
                          </Link>
                        }
                        primaryAction={
                          <Button
                            type="submit"
                            disabled={!dirty || isSubmitting}
                            loading={isSubmitting}
                            startIcon={<Check />}
                            size="L"
                          >
                            {formatMessage({
                              id: getTrad('ui.save'),
                              defaultMessage: 'Save',
                            })}
                          </Button>
                        }
                      />
                      <ContentLayout>
                        <Box paddingBottom={10}>
                          <Stack spacing={8}>
                            <Section>
                              <FormLayout fields={formLayout.menu} schema={schema.menu} />
                            </Section>
                            <MenuItemsManager fields={menuItemLayout} />
                          </Stack>
                        </Box>
                      </ContentLayout>
                    </>
                  );
                }}
              </MenuDataProvider>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

EditView.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default memo(EditView);
