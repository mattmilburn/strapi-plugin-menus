import get from 'lodash/get';

const getRelationValue = ( data, name ) => {
  const value = get( data, name ) ?? [];

  if ( ! value ) {
    return [];
  }

  return Array.isArray( value ) ? value : [ value ];
};

export default getRelationValue;
