import axios from 'axios';
import { auth } from '@strapi/helper-plugin';

const instance = axios.create( {
  baseURL: process.env.STRAPI_ADMIN_BACKEND_URL,
} );

instance.interceptors.request.use(
  async config => {
    config.headers = {
      Authorization: `Bearer ${auth.getToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    return config;
  },
  err => {
    Promise.reject( err );
  }
);

instance.interceptors.response.use(
  res => res,
  err => {
    // Do whatever you want to do with the error.
    if ( err.response?.status === 401 ) {
      auth.clearAppStorage();
      window.location.reload();
    }

    throw err;
  }
);

export default instance;
