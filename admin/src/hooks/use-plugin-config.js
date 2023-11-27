import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchClient, useNotification } from '@strapi/helper-plugin';

import { ACTION_RESOLVE_CONFIG } from '../constants';
import { pluginId } from '../utils';

const usePluginConfig = () => {
  const dispatch = useDispatch();
  const fetchClient = useFetchClient();
  const toggleNotification = useNotification();
  const { config, isLoading, schema } = useSelector((state) => state[`${pluginId}_config`]);

  useEffect(() => {
    // Do nothing if we have already loaded the data.
    if (!isLoading && !!config) {
      return;
    }

    fetchClient
      .get(`/${pluginId}/config`)
      .then((res) => {
        dispatch({
          type: ACTION_RESOLVE_CONFIG,
          data: {
            config: res?.data?.config ?? {},
            schema: res?.data?.schema ?? {},
          },
        });
      })
      .catch((err) => {
        if ('code' in err && err?.code === 'ERR_CANCELED') {
          return;
        }

        toggleNotification({
          type: 'warning',
          message: { id: 'notification.error' },
        });
      });
  }, [isLoading, config, dispatch, fetchClient, toggleNotification]);

  return {
    data: {
      config,
      schema,
    },
    isLoading,
  };
};

export default usePluginConfig;
