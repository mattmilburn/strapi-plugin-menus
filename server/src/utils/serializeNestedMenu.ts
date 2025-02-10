import get from 'lodash/get';
import has from 'lodash/has';
import omit from 'lodash/omit';

import sortByOrder from './sortByOrder';
import getDescendants from './getDescendants';

const removeParentData = (items: any[]): any[] =>
  items.reduce((acc, item) => {
    const sanitizedItem = omit(item, 'attributes.parent');
    sanitizedItem.attributes.children.data = removeParentData(item.attributes.children.data);

    return [...acc, sanitizedItem];
  }, []);

const serializeEntity = (data: any, keepParentData: boolean): any => {
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

const serializeNestedMenu = (res: any, keepParentData: boolean = false): any => {
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

export default serializeNestedMenu;
