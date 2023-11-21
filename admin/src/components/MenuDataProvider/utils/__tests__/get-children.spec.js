import getChildren from '../get-children';

describe('getChildren', () => {
  it('should return the immediate children of the given parent ID', () => {
    const items = [
      { id: 1, parent: { id: 1 } },
      { id: 2, parent: { id: 2 } },
      { id: 3, parent: { id: 1 } },
      { id: 4, parent: { id: 1 } },
      { id: 5, parent: { id: 3 } },
    ];
    const expected = [
      { id: 1, parent: { id: 1 } },
      { id: 3, parent: { id: 1 } },
      { id: 4, parent: { id: 1 } },
    ];
    const result = getChildren(1, items);

    expect(new Set(result)).toEqual(new Set(expected));
  });
});
