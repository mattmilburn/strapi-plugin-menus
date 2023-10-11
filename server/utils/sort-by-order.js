'use strict';

const sortByOrder = (obj) => {
  return obj.sort((a, b) => (a.attributes.order > b.attributes.order ? 1 : -1));
};

module.exports = sortByOrder;
