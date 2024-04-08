'use strict';

const { getService } = require('./utils');

module.exports = ({ strapi }) => {
  // Maybe register API documentation overrides for Strapi's documentation plugin.
  if (strapi.plugin('documentation')) {
    const overrides = getService('documentation').overrides();

    strapi
      .plugin('documentation')
      .service('override')
      .registerOverride(overrides, {
        pluginOrigin: 'menus',
        excludeFromGeneration: ['menus'],
      });
  }
};
