import getRelationValue from '../get-relation-value';

describe('getRelationValue', () => {
  const parent = {
    id: 1,
    title: 'Parent',
    url: '/parent',
  };

  const tags = [
    { id: 1, title: 'Tag A' },
    { id: 2, title: 'Tag B' },
    { id: 3, title: 'Tag C' },
  ];

  const data = {
    items: [
      {
        title: 'Title',
        url: '/parent/child',
        parent,
        tags,
      },
    ],
  };

  it('should return a single relation value in an array', () => {
    const expected = [parent];
    const result = getRelationValue(data, 'items[0].parent');

    expect(result).toEqual(expected);
  });

  it('should return multiple relation values in an array', () => {
    const result = getRelationValue(data, 'items[0].tags');

    expect(result).toEqual(tags);
  });

  it('should return an empty array if there is no relation value', () => {
    const expected = [];
    const result = getRelationValue(data, 'items[2].parent');

    expect(result).toEqual(expected);
  });
});
