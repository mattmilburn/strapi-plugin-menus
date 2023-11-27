'use strict';

const get = require('lodash/get');

const { default: defaultConfig } = require('../config');
const { UID_MENU, UID_MENU_ITEM } = require('../constants');
const { pluginId } = require('../utils');

module.exports = ({ strapi }) => ({
  async get() {
    const config = await strapi.config.get(`plugin.${pluginId}`, defaultConfig);

    return config;
  },

  async schema() {
    const contentTypes = strapi.plugin('content-manager').service('content-types');
    const menuModel = strapi.getModel(UID_MENU);
    const menuItemModel = strapi.getModel(UID_MENU_ITEM);

    // Determine custom relation fields, if any.
    const omitRelations = ['parent', 'root_menu', 'createdBy', 'updatedBy'];
    const relationFields = Object.keys(menuItemModel.attributes).filter((key) => {
      const attr = menuItemModel.attributes[key];

      if (attr && attr.type === 'relation' && !omitRelations.includes(key)) {
        return true;
      }

      return false;
    });

    // For the `MenuItem` schema, we're going to append extra metadata for custom
    // relations to more easily provide their necessary config on the frontend.
    const menuItemAttributes = await relationFields.reduce(async (prevPromise, name) => {
      const acc = await prevPromise;
      const attr = acc[name];

      if (!attr || attr.type !== 'relation' || !attr.target) {
        return acc;
      }

      const relationModel = strapi.getModel(attr.target);

      if (!relationModel) {
        return acc;
      }

      const relationConfig = await contentTypes.findConfiguration(relationModel);
      const mainFieldName = get(relationConfig, 'settings.mainField');
      const mainFieldType = get(relationModel, `attributes.${mainFieldName}.type`);

      const metadata = {
        relationType: attr.relation,
        targetModel: attr.target,
        mainField: {
          name: mainFieldName,
          schema: {
            type: mainFieldType,
          },
        },
        queryInfos: {
          shouldDisplayRelationLink: true,
        },
      };

      return {
        ...acc,
        [name]: {
          ...attr,
          metadata,
        },
      };
    }, menuItemModel.attributes);

    return {
      menu: menuModel.attributes,
      menuItem: menuItemAttributes,
    };
  },
});
