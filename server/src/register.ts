/**
 * @TODO - Should this be deprecated?
 */
import { type Core } from '@strapi/strapi';

import { PLUGIN_ID } from './constants';
import { getService } from './utils';

const register = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Maybe register API documentation overrides for Strapi's documentation plugin.
  if (strapi.plugin('documentation')) {
    const overrides = getService('documentation').overrides();

    strapi
      .plugin('documentation')
      .service('override')
      .registerOverride(overrides, {
        pluginOrigin: PLUGIN_ID,
        excludeFromGeneration: [PLUGIN_ID],
      });
  }
};

export default register;
