import serializeFields, { defaultGridProps } from '../serialize-fields';

describe('serializeFields', () => {
  it('should apply the correct name value to fields', () => {
    const fields = [
      {
        input: {
          name: 'title',
          type: 'text',
        },
        grid: {
          col: 6,
        },
      },
      {
        input: {
          name: 'url',
          type: 'text',
        },
        grid: {
          col: 6,
        },
      },
      {
        input: {
          name: 'target',
          type: 'select',
        },
        grid: {
          col: 6,
        },
      },
    ];
    const expected = [
      {
        input: {
          name: 'items[0].title',
          type: 'text',
        },
        grid: {
          col: 6,
        },
      },
      {
        input: {
          name: 'items[0].url',
          type: 'text',
        },
        grid: {
          col: 6,
        },
      },
      {
        input: {
          name: 'items[0].target',
          type: 'select',
        },
        grid: {
          col: 6,
        },
      },
    ];
    const result = serializeFields('items', 0, fields);

    expect(result).toEqual(expected);
  });

  it('should use the default grid prop if it is empty in config', () => {
    const fields = [
      {
        input: {
          name: 'title',
          type: 'text',
        },
      },
      {
        input: {
          name: 'url',
          type: 'text',
        },
      },
      {
        input: {
          name: 'target',
          type: 'select',
        },
      },
    ];
    const expected = [
      {
        input: {
          name: 'items[0].title',
          type: 'text',
        },
        grid: {
          ...defaultGridProps,
        },
      },
      {
        input: {
          name: 'items[0].url',
          type: 'text',
        },
        grid: {
          ...defaultGridProps,
        },
      },
      {
        input: {
          name: 'items[0].target',
          type: 'select',
        },
        grid: {
          ...defaultGridProps,
        },
      },
    ];
    const result = serializeFields('items', 0, fields);

    expect(result).toEqual(expected);
  });
});
