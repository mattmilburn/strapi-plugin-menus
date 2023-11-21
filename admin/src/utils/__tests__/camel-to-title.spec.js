import camelToTitle from '../camel-to-title';

describe('camelToTitle', () => {
  it('should convert a camel-case string to a title-formatted string', () => {
    const expected = 'Camel Case String';
    const result = camelToTitle('camelCaseString');

    expect(result).toEqual(expected);
  });
});
