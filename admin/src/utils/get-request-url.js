import { pluginId } from './';

const getRequestUrl = endpoint => {
  if ( endpoint ) {
    return `/${pluginId}/${endpoint}`;
  }

  return `/${pluginId}`;
}

export default getRequestUrl;
