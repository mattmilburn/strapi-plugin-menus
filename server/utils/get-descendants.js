'use strict';

const get = require('lodash/get');

const sortByOrder = require('./sort-by-order');

const getDescendants = (items, parentId) => {
  const results = [];
  const children = items.filter((item) => get(item, 'attributes.parent.data.id') === parentId);

  children.forEach((child) => {
    results.push({
      ...child,
      attributes: {
        ...child.attributes,
        children: {
          data: getDescendants(items, child.id),
        },
      },
    });
  });

  return sortByOrder(results);
};

module.exports = getDescendants;
