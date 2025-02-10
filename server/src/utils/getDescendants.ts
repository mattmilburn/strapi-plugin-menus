import get from 'lodash/get';

import sortByOrder from './sortByOrder';

const getDescendants = (items: any[], parentId: number | string): any[] => {
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

export default getDescendants;
