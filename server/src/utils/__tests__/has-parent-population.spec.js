'use strict';

const hasParentPopulation = require('../has-parent-population');

describe('hasParentPopulation', () => {
  it('should validate array population', () => {
    const params = { populate: ['items.parent', 'items.test'] };
    const result = hasParentPopulation(params);

    expect(result).toBe(true);
  });

  it('should validate object with array population', () => {
    const params = {
      populate: {
        items: {
          populate: ['parent', 'test'],
        },
      },
    };
    const result = hasParentPopulation(params);

    expect(result).toBe(true);
  });

  it('should validate object with object population', () => {
    const params = {
      populate: {
        items: {
          populate: {
            parent: true,
            test: true,
          },
        },
      },
    };
    const result = hasParentPopulation(params);

    expect(result).toBe(true);
  });
});
