'use strict';

const getNestedParams = require('../get-nested-params');

describe('getNestedParams', () => {
  it('should return params with parent population if populate is *', () => {
    const params = {
      foo: 'bar',
      populate: '*',
    };
    const expected = {
      foo: 'bar',
      populate: ['items', 'items.parent'],
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });

  it('should return params with parent population if populate is an array', () => {
    const params = {
      foo: 'bar',
      populate: ['category'],
    };
    const expected = {
      foo: 'bar',
      populate: ['category', 'items', 'items.parent'],
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });

  it('should not return params with duplicate keys', () => {
    const params = {
      foo: 'bar',
      populate: ['category', 'items', 'items.parent'],
    };
    const expected = {
      foo: 'bar',
      populate: ['category', 'items', 'items.parent'],
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });

  it('should return params with parent population if items.populate is *', () => {
    const params = {
      foo: 'bar',
      populate: {
        items: {
          populate: '*',
        },
      },
    };
    const expected = {
      foo: 'bar',
      populate: {
        items: {
          populate: {
            parent: true,
          },
        },
      },
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });

  it('should return params with parent population if items.populate is an object', () => {
    const params = {
      foo: 'bar',
      populate: {
        items: {
          populate: {
            image: true,
          },
        },
      },
    };
    const expected = {
      foo: 'bar',
      populate: {
        items: {
          populate: {
            image: true,
            parent: true,
          },
        },
      },
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });

  it('should return params with parent population if items.populate is an array', () => {
    const params = {
      foo: 'bar',
      populate: {
        items: {
          populate: ['items.image'],
        },
      },
    };
    const expected = {
      foo: 'bar',
      populate: {
        items: {
          populate: ['items.image', 'items', 'items.parent'],
        },
      },
    };
    const result = getNestedParams(params);

    expect(result).toEqual(expected);
  });
});
