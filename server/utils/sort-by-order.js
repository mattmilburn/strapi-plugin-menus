'use strict';

const sortByOrder = (arr) => {
  return arr.sort((a, b) => (a.attributes.order > b.attributes.order ? 1 : -1));
};

module.exports = sortByOrder;
