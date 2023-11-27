export const defaultBoxProps = {
  background: 'neutral0',
  hasRadius: true,
  shadow: 'filterShadow',
  paddingTop: 6,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 7,
};

const getBoxProps = (props = {}) => {
  return {
    ...defaultBoxProps,
    ...props,
  };
};

export default getBoxProps;
