'use strict';

const getDescendants = require('../get-descendants');

describe('getDescendants', () => {
  it('should return descendants of an entity', () => {
    const items = {
      data: {
        attributes: {
          items: {
            data: [
              {
                id: 1,
                attributes: {
                  order: 0,
                  title: 'Item one',
                  url: '/one',
                  target: null,
                  parent: null,
                },
              },
              {
                id: 2,
                attributes: {
                  order: 1,
                  title: 'Item two',
                  url: '/two',
                  target: null,
                  parent: null,
                },
              },
              {
                id: 3,
                attributes: {
                  order: 0,
                  title: 'Item three',
                  url: '/three',
                  target: null,
                  parent: {
                    data: {
                      id: 2,
                    },
                  },
                },
              },
              {
                id: 4,
                attributes: {
                  order: 0,
                  title: 'Item four',
                  url: '/four',
                  target: null,
                  parent: {
                    data: {
                      id: 3,
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };
    const expected = [
      {
        id: 3,
        attributes: {
          order: 0,
          title: 'Item three',
          url: '/three',
          target: null,
          parent: {
            data: {
              id: 2,
            },
          },
        },
      },
      {
        id: 4,
        attributes: {
          order: 0,
          title: 'Item four',
          url: '/four',
          target: null,
          parent: {
            data: {
              id: 3,
            },
          },
        },
      },
    ];
    const result = getDescendants(items, 2);

    expect(result).toEqual(expected);
  });
});
