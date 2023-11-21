import getFieldsLayout from '../get-fields-layout';

describe('getFieldsLayout', () => {
  const schema = {
    menu: {
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
    menuItem: {
      order: {
        type: 'integer',
      },
      title: {
        type: 'string',
        required: true,
      },
      url: {
        type: 'string',
      },
      target: {
        type: 'enumeration',
        enum: ['_blank', '_parent', '_self', '_top'],
      },
      root_menu: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'plugin::menus.menu',
        inversedBy: 'items',
        required: true,
      },
      parent: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'plugin::menus.menu-item',
      },
    },
  };
  const defaultLayout = [
    {
      input: {
        intlLabel: {
          defaultMessage: 'Title',
          id: 'menus.form.label.title',
        },
        placeholder: {
          id: 'menus.form.placeholder.untitled',
          defaultMessage: 'Untitled',
        },
        name: 'title',
        type: 'text',
        required: true,
      },
      grid: {
        col: 12,
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.url',
          defaultMessage: 'URL',
        },
        name: 'url',
        type: 'text',
      },
      grid: {
        col: 12,
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.target',
          defaultMessage: 'Target',
        },
        name: 'target',
        type: 'select',
        options: [
          {
            key: '_blank',
            value: '_blank',
            metadatas: {
              intlLabel: {
                id: 'menus.form.label.option._blank',
                defaultMessage: '_blank',
              },
            },
          },
          {
            key: '_parent',
            value: '_parent',
            metadatas: {
              intlLabel: {
                id: 'menus.form.label.option._parent',
                defaultMessage: '_parent',
              },
            },
          },
          {
            key: '_self',
            value: '_self',
            metadatas: {
              intlLabel: {
                id: 'menus.form.label.option._self',
                defaultMessage: '_self',
              },
            },
          },
          {
            key: '_top',
            value: '_top',
            metadatas: {
              intlLabel: {
                id: 'menus.form.label.option._top',
                defaultMessage: '_top',
              },
            },
          },
        ],
      },
      grid: {
        col: 6,
      },
    },
  ];

  it('should return a layout object combined with custom layout from plugin config', () => {
    const customLayouts = {
      test: [
        {
          input: {
            label: 'Test Select',
            name: 'test_select',
            type: 'select',
            description: 'Test description',
            options: ['option1', 'option2', 'option3'],
          },
        },
      ],
    };
    const expected = {
      link: defaultLayout,
      test: [
        {
          input: {
            intlLabel: {
              defaultMessage: 'Test Select',
              id: 'menus.customFields.test_select.label',
            },
            name: 'test_select',
            type: 'select',
            description: {
              defaultMessage: 'Test description',
              id: 'menus.customFields.test_select.description',
            },
            options: [
              {
                key: 'option1',
                value: 'option1',
                metadatas: {
                  intlLabel: {
                    id: 'menus.customFields.test_select.options.option1',
                    defaultMessage: 'option1',
                  },
                },
              },
              {
                key: 'option2',
                value: 'option2',
                metadatas: {
                  intlLabel: {
                    id: 'menus.customFields.test_select.options.option2',
                    defaultMessage: 'option2',
                  },
                },
              },
              {
                key: 'option3',
                value: 'option3',
                metadatas: {
                  intlLabel: {
                    id: 'menus.customFields.test_select.options.option3',
                    defaultMessage: 'option3',
                  },
                },
              },
            ],
          },
        },
      ],
    };
    const result = getFieldsLayout(defaultLayout, customLayouts, schema);

    expect(result).toEqual(expected);
  });

  it('should append certain fields to the default layout link group', () => {
    const customLayouts = {
      link: [
        {
          input: {
            label: 'Custom Field',
            name: 'custom_field',
            type: 'text',
          },
        },
      ],
    };
    const expected = {
      link: [
        ...defaultLayout,
        {
          input: {
            intlLabel: {
              defaultMessage: 'Custom Field',
              id: 'menus.customFields.custom_field.label',
            },
            name: 'custom_field',
            type: 'text',
          },
        },
      ],
    };
    const result = getFieldsLayout(defaultLayout, customLayouts, schema);

    expect(result).toEqual(expected);
  });
});
