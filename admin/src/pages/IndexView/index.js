import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import get from 'lodash/get';
import {
  DynamicTable,
  EmptyStateLayout,
  useAPIErrorHandler,
  useFetchClient,
  useNotification,
  useOverlayBlocker,
  useQueryParams,
} from '@strapi/helper-plugin';
import { useNotifyAT } from '@strapi/design-system';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import Plus from '@strapi/icons/Plus';

import { getRequestUrl, getTrad, pluginId, pluginName } from '../../utils';
import { Layout, MenuRows, PaginationFooter } from '../../components';

const QUERY_KEY = 'menus-index';

/**
 * @TODO - This primary action currently does not render when the `DynamicTable`
 * passes the `action` prop through to `EmptyStateLayout`. No idea why.
 */
const PrimaryAction = ({ children, onClick, size, variant }) => (
  <Button onClick={onClick} startIcon={<Plus />} variant={variant} size={size}>
    {children}
  </Button>
);

PrimaryAction.defaultProps = {
  size: 'L',
  variant: 'default',
};

PrimaryAction.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  variant: PropTypes.string,
};

const IndexView = ({ history }) => {
  const { formatAPIError } = useAPIErrorHandler();
  const fetchClient = useFetchClient();
  const { formatMessage } = useIntl();
  const { notifyStatus } = useNotifyAT();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const queryClient = useQueryClient();
  const [{ query }] = useQueryParams();

  const pageSize = get(query, 'pageSize', 10);
  const page = get(query, 'page', 1) * pageSize - pageSize;

  const getAllMenus = async () => {
    const { data } = await fetchClient.get(
      getRequestUrl(null, {
        populate: '*',
        pagination: {
          start: page,
          limit: pageSize,
        },
      })
    );

    return data;
  };

  const { data, refetch, status } = useQuery(QUERY_KEY, () => getAllMenus(), {
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

  useEffect(() => {
    refetch();
  }, [page, pageSize, refetch]);

  const deleteMutation = useMutation((id) => fetchClient.delete(getRequestUrl(id)), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QUERY_KEY);

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('ui.deleted.menu'),
          defaultMessage: 'Menu has been deleted',
        },
      });
    },
    onError: (err) => {
      if (err?.response?.data?.data) {
        toggleNotification({
          type: 'warning',
          message: err.response.data.data,
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: formatAPIError(err),
        });
      }
    },
    onSettled: () => {
      unlockApp();
    },
  });

  const onClickCreate = () => history.push(`/plugins/${pluginId}/create`);

  const onConfirmDelete = async (id) => {
    lockApp();

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      unlockApp();
    }
  };

  const isLoading = status !== 'success';
  const pageCount = data?.meta?.total ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  const tableHeaders = [
    {
      name: 'title',
      key: 'title',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.title'),
          defaultMessage: 'Title',
        }),
        sortable: true,
      },
    },
    {
      name: 'slug',
      key: 'slug',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.slug'),
          defaultMessage: 'Slug',
        }),
        sortable: true,
      },
    },
    {
      name: 'items',
      key: 'items',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.items'),
          defaultMessage: 'Items',
        }),
        sortable: false,
      },
    },
  ];

  return (
    <Layout
      isLoading={isLoading}
      title={formatMessage({
        id: getTrad('plugin.name'),
        defaultMessage: pluginName,
      })}
    >
      <HeaderLayout
        title={formatMessage({
          id: getTrad('plugin.name'),
          defaultMessage: pluginName,
        })}
        subtitle={formatMessage({
          id: getTrad('index.header.subtitle'),
          defaultMessage: 'Customize the structure of menus and menu items',
        })}
        primaryAction={
          <PrimaryAction onClick={onClickCreate}>
            {formatMessage({
              id: getTrad('ui.create.menu'),
              defaultMessage: 'Create new menu',
            })}
          </PrimaryAction>
        }
      />
      <ContentLayout>
        <Box paddingBottom={10}>
          {!!data?.data?.length ? (
            <>
              <DynamicTable
                contentType="menus"
                isLoading={isLoading}
                headers={tableHeaders}
                rows={data.data}
                action={
                  <PrimaryAction onClick={onClickCreate} size="S" variant="secondary">
                    {formatMessage({
                      id: getTrad('ui.create.menu'),
                      defaultMessage: 'Create new menu',
                    })}
                  </PrimaryAction>
                }
                onConfirmDelete={onConfirmDelete}
              >
                <MenuRows
                  data={data.data ?? []}
                  onClickClone={(id) => history.push(`/plugins/${pluginId}/clone/${id}`)}
                  onClickEdit={(id) => history.push(`/plugins/${pluginId}/edit/${id}`)}
                />
              </DynamicTable>
              <PaginationFooter pagination={{ pageCount }} />
            </>
          ) : (
            <EmptyStateLayout
              content={{
                id: getTrad('index.state.empty'),
                defaultMessage: 'No menus found',
              }}
              action={
                <PrimaryAction onClick={onClickCreate} size="S" variant="secondary">
                  {formatMessage({
                    id: getTrad('ui.create.menu'),
                    defaultMessage: 'Create new menu',
                  })}
                </PrimaryAction>
              }
            />
          )}
        </Box>
      </ContentLayout>
    </Layout>
  );
};

IndexView.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default memo(IndexView);
