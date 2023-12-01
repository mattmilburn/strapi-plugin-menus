'use strict';

const { UID_MENU, UID_MENU_ITEM, UID_UPLOAD_FILE } = require('../constants');

const SPEC_NESTING_LIMIT = 3;

module.exports = ({ strapi }) => ({
  getAttributesSpec(uid, level = 1) {
    const model = strapi.getModel(uid);

    if (!model) {
      return {};
    }

    const spec = Object.entries(model.attributes).reduce((acc, [key, value]) => {
      let type = 'string';
      let extraProps = {};

      if (value.type === 'boolean') {
        type = 'boolean';
      }

      if (value.type === 'datetime') {
        extraProps.format = 'date-time';
      }

      if (value.type === 'json') {
        type = 'object';
      }

      if (['biginteger', 'decimal', 'float', 'integer'].includes(value.type)) {
        type = 'number';
      }

      if (value.type === 'media') {
        type = 'object';
        extraProps.properties = this.getRelationAttributesSpec(
          UID_UPLOAD_FILE,
          level,
          value.multiple
        );
      }

      if (value.type === 'relation') {
        type = 'object';
        extraProps.properties = this.getRelationAttributesSpec(
          value.target,
          level,
          value.relation.includes('Many')
        );
      }

      return {
        ...acc,
        [key]: {
          ...extraProps,
          type,
        },
      };
    }, {});

    return spec;
  },

  getRelationAttributesSpec(uid, level = 1, multiple = false) {
    const relationSpec = {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        attributes: {
          type: 'object',
          properties: level < SPEC_NESTING_LIMIT ? this.getAttributesSpec(uid, level + 1) : {},
        },
      },
    };

    return {
      data: multiple
        ? {
            type: 'array',
            items: relationSpec,
          }
        : relationSpec,
    };
  },

  getRequiredAttributes(uid) {
    const model = strapi.getModel(uid);
    const attrs = model.attributes;

    return Object.keys(attrs).filter((attr) => attrs[attr].required);
  },

  overrides() {
    const menuSchema = this.getAttributesSpec(UID_MENU);
    const menuItemSchema = this.getAttributesSpec(UID_MENU_ITEM);

    const menuRequiredAttrs = this.getRequiredAttributes(UID_MENU);
    const menuItemRequiredAttrs = this.getRequiredAttributes(UID_MENU_ITEM);

    return {
      components: {
        schemas: {
          Menu: {
            type: 'object',
            properties: menuSchema,
            required: menuRequiredAttrs,
          },
          MenuItem: {
            type: 'object',
            properties: menuItemSchema,
            required: menuItemRequiredAttrs,
          },
        },
      },
      paths: {
        '/menus': {
          get: {
            tags: ['Menu'],
            summary: 'Get a list of menus',
            description:
              'Common parameters such as `populate`, `filters`, `pagination`, etc. are also available to use.',
            parameters: [
              {
                name: 'nested',
                in: 'path',
                description:
                  'Serialize menu items into a nested format, otherwise they are returned as a flat list.',
                deprecated: false,
                required: false,
                schema: {
                  type: 'boolean',
                },
              },
            ],
            responses: {
              200: {
                description: 'Return an array of menus',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Menu',
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Menu'],
            summary: 'Create a menu',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: menuRequiredAttrs,
                    properties: menuSchema,
                  },
                },
              },
            },
            responses: {
              200: {
                description: 'Return an array of created menus',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Menu',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/menus/{id}': {
          get: {
            tags: ['Menu'],
            summary: 'Get a menu',
            description:
              'Common parameters such as `populate`, `filters`, `pagination`, etc. are also available to use.',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: '',
                deprecated: false,
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'nested',
                in: 'path',
                description:
                  'Serialize menu items into a nested format, otherwise they are returned as a flat list.',
                deprecated: false,
                required: false,
                schema: {
                  type: 'boolean',
                },
              },
            ],
            responses: {
              200: {
                description: 'Get a specific menu',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Menu',
                    },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Menu'],
            summary: 'Update a menu',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: menuRequiredAttrs,
                    properties: menuSchema,
                  },
                },
              },
            },
            responses: {
              200: {
                description: 'Return an updated menu',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Menu',
                    },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Menu'],
            summary: 'Delete a menu',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: '',
                deprecated: false,
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              200: {
                description: 'Delete a menu',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Menu',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  },
});
