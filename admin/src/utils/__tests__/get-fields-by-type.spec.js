import getFieldsByType from '../get-fields-by-type';

describe('getFieldsByType', () => {
  const schema = {
    title: { type: 'string' },
    url: { type: 'string' },
    target: {
      type: 'enumeration',
      enum: ['_blank', '_parent', '_self', '_top'],
    },
    image: {
      type: 'media',
      allowedTypes: ['images'],
      multiple: false,
    },
  };

  it('should return fields of the given type', () => {
    const expected = ['title', 'url'];
    const result = getFieldsByType(schema, ['string']);

    expect(result).toEqual(expected);
  });

  it('should return an empty array if there are no matching types', () => {
    const expected = [];
    const result = getFieldsByType(schema, ['uid']);

    expect(result).toEqual(expected);
  });

  it('should omit fields when `omitKeys` param is used', () => {
    const expected = ['title'];
    const result = getFieldsByType(schema, ['string'], ['url']);

    expect(result).toEqual(expected);
  });
});
