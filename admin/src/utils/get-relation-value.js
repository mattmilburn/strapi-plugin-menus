import get from 'lodash/get';

const getRelationValue = ( data, path ) => {
  const value = get( data, path );

  if ( ! value ) {
    return [];
  }

  return Array.isArray( value ) ? value : [ value ];
};

export default getRelationValue;
