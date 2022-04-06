import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { request, useNotification } from '@strapi/helper-plugin';

import { RESOLVE_CONFIG } from '../constants';
import { pluginId } from '../utils';

const fetchConfig = async ( toggleNotification ) => {
  try {
    const endpoint = `/${pluginId}/config`;
    const data = await request( endpoint, { method: 'GET' } );

    return data ?? {};
  } catch ( err ) {
    toggleNotification( {
      type: 'warning',
      message: { id: 'notification.error' },
    } );

    return err;
  }
};

const usePluginConfig = () => {
  const dispatch = useDispatch();
  const toggleNotification = useNotification();

  const stateKey = `${pluginId}_config`;
  const config = useSelector( state => state[ stateKey ].config );
  const schema = useSelector( state => state[ stateKey ].schema );
  const isLoading = useSelector( state => state[ stateKey ].isLoading );

  useEffect( () => {
    fetchConfig( toggleNotification ).then( data => {
      dispatch( { type: RESOLVE_CONFIG, data } );
    } );
  }, [ dispatch, toggleNotification ] );

  return { isLoading, config, schema };
};

export default usePluginConfig;
