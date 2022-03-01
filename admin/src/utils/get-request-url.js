import qs from 'qs';

import { pluginId } from './';

const getRequestUrl = ( endpoint, params ) => {
  let url = `/${pluginId}`;

  if ( endpoint ) {
    url = `${url}/${endpoint}`;
  }

  if ( params ) {
    url = `${url}?${qs.stringify( params )}`;
  }

  return url;
}

export default getRequestUrl;
