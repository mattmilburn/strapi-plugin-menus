'use strict';

const get = require('lodash/get');
const has = require('lodash/has');
const omit = require('lodash/omit');

const sortByOrder = require('./sort-by-order');
const getDescendants = require('./get-descendants');

const removeParentData = (items) =>
  items.reduce((acc, item) => {
    let sanitizedItem = omit(item, 'attributes.parent');
    sanitizedItem.attributes.children.data = removeParentData(item.attributes.children.data);

    return [...acc, sanitizedItem];
  }, []);

const serializeEntity = (data, keepParentData) => {
  const items = get(data, 'attributes.items.data', []);

  // Do nothing if there are no items to serialize.
  if (!items.length) {
    return data;
  }

  const rootItems = items.filter((item) => !has(item, 'attributes.parent.data.id'));

  // Assign ordered and nested items to root items.
  const nestedItems = rootItems.reduce((acc, item) => {
    const rootItem = {
      ...item,
      attributes: {
        ...item.attributes,
        children: {
          data: getDescendants(items, item.id),
        },
      },
    };

    return [...acc, rootItem];
  }, []);

  const sanitizedItems = !keepParentData ? removeParentData(nestedItems) : nestedItems;

  return {
    ...data,
    attributes: {
      ...data.attributes,
      items: {
        data: sortByOrder(sanitizedItems),
      },
    },
  };
};

const serializeNestedMenu = (res, keepParentData) => {
  const data = get(res, 'data');
  let sanitizedData;

  if (Array.isArray(data)) {
    sanitizedData = data.map((_data) => serializeEntity(_data, keepParentData));
  } else {
    sanitizedData = serializeEntity(data, keepParentData);
  }

  return {
    ...res,
    data: sanitizedData,
  };
};

module.exports = serializeNestedMenu;
