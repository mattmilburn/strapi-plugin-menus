import sanitizeFormData from '../sanitize-form-data';

describe('sanitizeFormData', () => {
  const menuLayout = [
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.title',
          defaultMessage: 'Title',
        },
        name: 'title',
        type: 'text',
        required: true,
      },
      grid: {
        col: 6,
        s: 12,
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.slug',
          defaultMessage: 'Slug',
        },
        name: 'slug',
        type: 'uid',
        contentTypeUID: 'plugin::menus.menu',
        attribute: {
          targetField: 'title',
        },
        required: true,
      },
      grid: {
        col: 6,
        s: 12,
      },
    },
  ];
  const menuItemLayout = [
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.title',
          defaultMessage: 'Title',
        },
        name: 'title',
        type: 'text',
        placeholder: {
          id: 'menus.form.placeholder.untitled',
          defaultMessage: 'Untitled',
        },
        required: true,
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
    },
    {
      input: {
        intlLabel: {
          id: 'menus.form.label.target',
          defaultMessage: 'Target',
        },
        name: 'target',
        type: 'select',
        options: ['_blank', '_parent', '_self', '_top'].map((option) => ({
          key: option,
          value: option,
          metadatas: {
            intlLabel: {
              id: `menus.form.label.option.${option}`,
              defaultMessage: option,
            },
          },
        })),
      },
      grid: {
        col: 6,
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_bool.label',
          defaultMessage: 'Example Boolean',
        },
        name: 'example_bool',
        type: 'boolean',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_date.label',
          defaultMessage: 'Example Date',
        },
        name: 'example_date',
        type: 'date',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_datetime.label',
          defaultMessage: 'Example Date Time',
        },
        name: 'example_datetime',
        type: 'datetime',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_media.label',
          defaultMessage: 'Example Media',
        },
        name: 'example_media',
        type: 'media',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_number.label',
          defaultMessage: 'Example Number',
        },
        name: 'example_number',
        type: 'number',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_relation_one.label',
          defaultMessage: 'Example Relation (hasOne)',
        },
        name: 'example_relation_one',
        type: 'relation',
      },
    },
    {
      input: {
        intlLabel: {
          id: 'menus.customFields.example_relation_many.label',
          defaultMessage: 'Example Relation (hasMany)',
        },
        name: 'example_relation_many',
        type: 'relation',
      },
    },
  ];

  it('should sanitize form data for Menu', () => {
    const data = {
      id: 1,
      title: ' Test Menu ',
      slug: 'test-menu',
      items: [],
    };
    const expected = {
      id: 1,
      title: 'Test Menu',
      slug: 'test-menu',
      items: [],
    };
    const result = sanitizeFormData(data, data, menuLayout, false);

    expect(result).toEqual(expected);
  });

  it('should sanitize form data for MenuItem', () => {
    const data = {
      id: 1,
      order: 0,
      title: ' Test title ',
      url: '/test',
      target: '_blank',
      parent: null,
      example_bool: true,
      example_date: '2023-11-07',
      example_datetime: '2023-11-07T04:30:00.000Z',
      example_media: {
        id: 1,
        name: 'example.jpg',
        url: '/uploads/example.jpg',
      },
      example_number: 7,
    };
    const expected = {
      id: 1,
      order: 0,
      title: 'Test title',
      url: '/test',
      target: '_blank',
      parent: null,
      example_bool: true,
      example_date: '2023-11-07T00:00:00.000Z',
      example_datetime: '2023-11-07T04:30:00.000Z',
      example_media: 1,
      example_number: 7,
    };
    const result = sanitizeFormData(data, data, menuItemLayout, false);

    expect(result).toEqual(expected);
  });

  it('should sanitize connecting and disconnecting relations data', () => {
    const prevData = {
      id: 1,
      order: 0,
      title: 'Test title',
      url: '/test',
      target: '_blank',
      parent: null,
      example_relation_one: null,
      example_relation_many: [
        {
          id: 1,
          title: 'One of many',
        },
        {
          id: 2,
          title: 'Two of many',
        },
        {
          id: 3,
          title: 'Three of many',
        },
      ],
    };
    const nextData = {
      id: 1,
      order: 0,
      title: 'Test title',
      url: '/test',
      target: '_blank',
      parent: null,
      example_relation_one: [
        {
          id: 1,
          title: 'One of one',
        },
      ],
      example_relation_many: [
        {
          id: 1,
          title: 'One of many',
        },
        {
          id: 3,
          title: 'Three of many',
        },
        {
          id: 4,
          title: 'Four of many',
        },
      ],
    };
    const expected = {
      id: 1,
      order: 0,
      title: 'Test title',
      url: '/test',
      target: '_blank',
      parent: null,
      example_relation_one: {
        connect: [{ id: 1 }],
        disconnect: [],
      },
      example_relation_many: {
        connect: [{ id: 4 }],
        disconnect: [{ id: 2 }],
      },
    };
    const result = sanitizeFormData(nextData, prevData, menuItemLayout, false);

    expect(result).toEqual(expected);
  });
});
