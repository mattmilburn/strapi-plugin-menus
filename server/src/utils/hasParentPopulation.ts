import get from 'lodash/get';
import has from 'lodash/has';

/**
 * @NOTE - Populating the parent field in each menu item is necessary for serializing
 * items into a nested structure. Once they are sorted and nested, the parent
 * population will either be removed or remain in the response data.
 */

const hasParentPopulation = (params: any): boolean => {
  const populate = get(params, 'populate');

  // Array population.
  if (Array.isArray(populate)) {
    return populate.includes('items.parent');
  }

  const itemsPopulate = get(populate, 'items.populate');

  // Object with array population.
  if (Array.isArray(itemsPopulate)) {
    return itemsPopulate.includes('parent');
  }

  return has(itemsPopulate, 'parent');
};

export default hasParentPopulation;
