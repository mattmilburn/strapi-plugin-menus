import getBoxProps, { defaultBoxProps } from '../get-box-props';

describe('getBoxProps', () => {
  it('should return default box props when no arguments are given', () => {
    const result = getBoxProps();

    expect(result).toEqual(defaultBoxProps);
  });

  it('should return box props with custom props applied', () => {
    const props = { marginBottom: 16, paddingTop: 16 };
    const result = getBoxProps(props);

    expect(result.marginBottom).toBe(16);
    expect(result.paddingTop).toBe(16);
  });
});
