import has from 'lodash/has';
import head from 'lodash/head';

const transformResponse = data => {
  if ( has( data, 'data' ) ) {
    return transformResponse( data.data );
  }

  // Single entry.
  if ( has( data, 'attributes' ) ) {
    return transformResponse( {
      id: data.id,
      ...data.attributes,
    } );
  }

  // Array of entries.
  if ( Array.isArray( data ) && data.length && has( head( data ), 'attributes' ) ) {
    return data.map( item => transformResponse( item ) );
  }

  // Loop through properties.
  if ( has( data, 'id' ) ) {
    Object.entries( data ).forEach( ( [ key, value ] ) => {
      // Do nothing for null fields.
      if ( ! value ) {
        return;
      }

      if ( has( value, 'data' ) ) {
        data[ key ] = transformResponse( value.data );
      }
    } );
  }

  return data;
};

export default transformResponse;
