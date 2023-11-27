'use strict';

const { getService } = require('./utils');

module.exports = async ({ strapi }) => {
  // Maybe register API documentation overrides for Strapi's documentation plugin.
  if (strapi.plugin('documentation')) {
    const overrides = await getService('documentation').overrides();

    strapi
      .plugin('documentation')
      .service('override')
      .registerOverride(overrides, {
        pluginOrigin: 'menus',
        excludeFromGeneration: ['menus'],
      });
  }
};
