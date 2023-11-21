import get from 'lodash/get';

const getRelationValue = (data, namePath) => {
  const value = get(data, namePath);

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export default getRelationValue;
