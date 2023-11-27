import transformResponse from '../transform-response';

describe('transformResponse', () => {
  it('should transform API response to remove data and attributes wrappers', () => {
    const res = {
      data: {
        id: 1,
        attributes: {
          title: 'Test Menu',
          slug: 'test-menu',
          items: {
            data: [
              {
                id: 1,
                attributes: {
                  order: 0,
                  title: 'Test Item',
                  url: '/test-item',
                  target: null,
                  parent: {
                    data: null,
                  },
                },
              },
            ],
          },
        },
      },
      meta: {},
    };
    const expected = {
      id: 1,
      title: 'Test Menu',
      slug: 'test-menu',
      items: [
        {
          id: 1,
          order: 0,
          title: 'Test Item',
          url: '/test-item',
          target: null,
          parent: null,
        },
      ],
    };
    const result = transformResponse(res);

    expect(result).toEqual(expected);
  });
});
