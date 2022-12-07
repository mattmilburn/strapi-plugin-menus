import get from 'lodash/get';

const getFieldError = ( errors, name, label ) => {
  const msg = get( errors, name, null );

  // Ensure that repeatable items remove the array bracket notation from the error.
  if ( typeof msg === 'string' ) {
    return msg.replace( name, label );
  }

  return msg;
};

export default getFieldError;
