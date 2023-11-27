import getRequestUrl from '../get-request-url';
import pluginId from '../plugin-id';

describe('getRequestUrl', () => {
  it('should return the menus plugin API URL', () => {
    const expected = `/${pluginId}`;
    const result = getRequestUrl();

    expect(result).toEqual(expected);
  });

  it('should return the menus plugin API URL with a path', () => {
    const expected = `/${pluginId}/test`;
    const result = getRequestUrl('test');

    expect(result).toEqual(expected);
  });

  it('should return the menus plugin API URL with a query string', () => {
    const expected = `/${pluginId}/test?foo=bar`;
    const result = getRequestUrl('test', { foo: 'bar' });

    expect(result).toEqual(expected);
  });
});
