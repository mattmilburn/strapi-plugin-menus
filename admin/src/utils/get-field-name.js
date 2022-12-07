const getFieldName = name => {
  if ( name.indexOf( '.' ) !== -1 ) {
    return name.split( '.' ).slice( 1 ).join( '' );
  }

  return name;
};

export default getFieldName;
