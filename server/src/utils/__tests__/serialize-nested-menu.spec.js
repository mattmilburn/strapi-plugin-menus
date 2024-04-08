'use strict';

const serializeNestedMenu = require('../serialize-nested-menu');

describe('serializeNestedMenu', () => {
  it('should serialize one nested menu', () => {
    const res = {
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
            ],
          },
        },
      },
    };
    const expected = {
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
                  children: {
                    data: [],
                  },
                },
              },
              {
                id: 2,
                attributes: {
                  order: 1,
                  title: 'Item two',
                  url: '/two',
                  target: null,
                  children: {
                    data: [
                      {
                        id: 3,
                        attributes: {
                          order: 0,
                          title: 'Item three',
                          url: '/three',
                          target: null,
                          children: {
                            data: [],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    };
    const result = serializeNestedMenu(res);

    expect(result).toEqual(expected);
  });

  it('should keep parent relation data if `keepParentData` is true', () => {
    const res = {
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
            ],
          },
        },
      },
    };
    const expected = {
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
                  children: {
                    data: [],
                  },
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
                  children: {
                    data: [
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
                          children: {
                            data: [],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    };
    const result = serializeNestedMenu(res, true);

    expect(result).toEqual(expected);
  });
});
