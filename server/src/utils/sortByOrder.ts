const sortByOrder = (arr: Array<any>): Array<any> => {
  return arr.sort((a, b) => (a.attributes.order > b.attributes.order ? 1 : -1));
};

export default sortByOrder;
