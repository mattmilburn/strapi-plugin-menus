import qs from 'qs';

import pluginId from './plugin-id';

const getRequestUrl = (path, params = {}) => {
  const query = qs.stringify(params, { addQueryPrefix: true });
  let url = `/${pluginId}`;

  if (path) {
    url = `${url}/${path}`;
  }

  return `${url}${query}`;
};

export default getRequestUrl;
