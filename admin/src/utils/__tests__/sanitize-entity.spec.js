import sanitizeEntity from '../sanitize-entity';

describe('sanitizeEntity', () => {
  it('should omit unnecessary props from entity objects', () => {
    const entity = {
      id: 1,
      title: 'Test',
      created_at: null,
      created_by: null,
      createdAt: null,
      createdBy: null,
      updated_at: null,
      updated_by: null,
      updatedAt: null,
      updatedBy: null,
    };
    const expected = { id: 1, title: 'Test' };
    const result = sanitizeEntity(entity);

    expect(result).toEqual(expected);
  });
});
