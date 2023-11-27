import getFieldName from '../get-field-name';

describe('getFieldName', () => {
  it('should return the field name with nested accessors removed', () => {
    const expected = 'title';
    const result = getFieldName('items[1].title');

    expect(result).toEqual(expected);
  });

  it('should return the original field name if it does not contain nested accessors', () => {
    const expected = 'title';
    const result = getFieldName(expected);

    expect(result).toEqual(expected);
  });
});
