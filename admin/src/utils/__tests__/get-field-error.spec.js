import getFieldError from '../get-field-error';

describe('getFieldError', () => {
  it('should return the error message for a field', () => {
    const namePath = 'items[0].url';
    const name = 'url';
    const errorMsg = 'menus.error.url.invalid';
    const errors = {
      items: [{ url: errorMsg }],
    };
    const result = getFieldError(errors, namePath, name);

    expect(result).toBe(errorMsg);
  });

  it('should return null if is no error for the field', () => {
    const namePath = 'items[2].url';
    const name = 'url';
    const errors = {
      items: [{ url: 'menus.error.url.invalid' }],
    };
    const result = getFieldError(errors, namePath, name);

    expect(result).toBeNull();
  });
});
