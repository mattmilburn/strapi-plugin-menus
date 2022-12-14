import omit from 'lodash/omit';

const getFieldsByType = ( schema, types, omitKeys = [] ) => {
  const keys = Object.keys( omit( schema , omitKeys ) );

  return keys.filter( key => types.includes( schema[ key ].type ) );
};

export default getFieldsByType;
