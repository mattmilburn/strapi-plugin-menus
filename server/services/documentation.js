'use strict';

const { UID_MENU, UID_MENU_ITEM } = require('../constants');

const SPEC_NESTING_LIMIT = 3;

module.exports = ({ strapi }) => ({
  getAttributesSpec(uid, level = 1) {
    const model = strapi.getModel(uid);

    const spec = Object.entries(model.attributes).reduce((acc, [key, value]) => {
      let type = 'string';
      let extraProps = {};

      if (value.type === 'boolean') {
        type = 'boolean';
      }

      if (value.type === 'datetime') {
        extraProps.format = 'date-time';
      }

      if (value.type === 'media' || value.type === 'json') {
        type = 'object';
      }

      if (['biginteger', 'decimal', 'float', 'integer'].includes(value.type)) {
        type = 'number';
      }

      if (value.type === 'relation') {
        const relationSpec = {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            attributes: {
              type: 'object',
              properties:
                level < SPEC_NESTING_LIMIT ? this.getAttributesSpec(value.target, level + 1) : {},
            },
          },
        };

        type = 'object';
        extraProps.properties = {
          data: value.relation.includes('Many')
            ? {
                type: 'array',
                items: relationSpec,
              }
            : relationSpec,
        };
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

  getRequiredAttributes(uid) {
    const model = strapi.getModel(uid);
    const attrs = model.attributes;

    return Object.keys(attrs).filter((attr) => attrs[attr].required);
  },

  async overrides() {
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
            summary: 'Get list of menus',
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
        },
      },
    };
  },
});
