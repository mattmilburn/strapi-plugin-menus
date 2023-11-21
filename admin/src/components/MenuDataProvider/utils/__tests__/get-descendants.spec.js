import getDescendants from '../get-descendants';

describe('getDescendants', () => {
  const items = [
    { id: 1, parent: null },
    { id: 2, parent: { id: 6 } },
    { id: 3, parent: { id: 1 } },
    { id: 4, parent: { id: 1 } },
    { id: 5, parent: { id: 3 } },
    { id: 6, parent: null },
    { id: 7, parent: { id: 4 } },
  ];

  it('should return an array of entities who are descendants of the given parent ID', () => {
    const expected = [
      { id: 3, parent: { id: 1 } },
      { id: 4, parent: { id: 1 } },
      { id: 5, parent: { id: 3 } },
      { id: 7, parent: { id: 4 } },
    ];
    const result = getDescendants(1, items);

    expect(new Set(result)).toEqual(new Set(expected));
  });

  it('should return descendants in a nested structure', () => {
    const expected = [
      {
        id: 3,
        parent: { id: 1 },
        children: [
          {
            id: 5,
            parent: { id: 3 },
            children: [],
          },
        ],
      },
      {
        id: 4,
        parent: { id: 1 },
        children: [
          {
            id: 7,
            parent: { id: 4 },
            children: [],
          },
        ],
      },
    ];
    const result = getDescendants(1, items, true);

    expect(new Set(result)).toEqual(new Set(expected));
  });
});
