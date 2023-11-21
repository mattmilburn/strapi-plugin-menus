import sortByOrder from '../sort-by-order';

describe('sortByOrder', () => {
  it('should sort an array of objects by their `order` prop', () => {
    const list = [
      { id: 1, order: 1 },
      { id: 2, order: 4 },
      { id: 3, order: 2 },
      { id: 4, order: 3 },
    ];
    const expected = [
      { id: 1, order: 1 },
      { id: 3, order: 2 },
      { id: 4, order: 3 },
      { id: 2, order: 4 },
    ];
    const result = sortByOrder(list);

    expect(result).toEqual(expected);
  });
});
