'use strict';

module.exports = {
  kind: 'collectionType',
  collectionName: 'menus',
  info: {
    name: 'Menu',
    displayName: 'Menu',
    singularName: 'menu',
    pluralName: 'menus',
    tableName: 'menus',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    items: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::menus.menu-item',
      mappedBy: 'root_menu',
    },
  },
};
