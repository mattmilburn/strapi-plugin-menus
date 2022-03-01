'use strict';

const sortByOrder = obj => {
  return obj.sort( ( a, b ) => a.order > b.order ? 1 : -1 );
};

module.exports = sortByOrder;
