const getBoxProps = ( props = {} ) => {
  return {
    background: 'neutral0',
    hasRadius: true,
    shadow: 'filterShadow',
    paddingTop: 6,
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 7,
    ...props,
  };
};

export default getBoxProps;
