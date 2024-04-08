'use strict';

const isListable = require('../is-listable');

describe('isListable', () => {
  it('should return true if the attribute is listable', () => {
    const schema = {
      attributes: {
        title: { type: 'string' },
        content: { type: 'string' },
      },
    };
    const result = isListable(schema, 'title');

    expect(result).toBe(true);
  });

  it('should return true if the relation attribute is listable', () => {
    const schema = {
      attributes: {
        title: { type: 'string' },
        content: { type: 'string' },
        parent: {
          type: 'relation',
          relationType: 'oneToOne',
          target: 'api::test.test',
        },
      },
    };
    const result = isListable(schema, 'parent');

    expect(result).toBe(true);
  });

  it('should return false if the attribute is not listable', () => {
    const schema = {
      attributes: {
        title: { type: 'string' },
        content: { type: 'string' },
        secret: { type: 'password' },
      },
    };
    const result = isListable(schema, 'secret');

    expect(result).toBe(false);
  });

  it('should return false if the attribute does not exist on the schema', () => {
    const schema = {
      attributes: {
        name: { type: 'string' },
        content: { type: 'string' },
      },
    };
    const result = isListable(schema, 'title');

    expect(result).toBe(false);
  });

  it('should return false if the attribute is hidden', () => {
    const schema = {
      attributes: {
        title: { type: 'string' },
        content: { type: 'string' },
      },
      config: {
        attributes: {
          title: { hidden: true },
        },
      },
    };
    const result = isListable(schema, 'title');

    expect(result).toBe(false);
  });
});
