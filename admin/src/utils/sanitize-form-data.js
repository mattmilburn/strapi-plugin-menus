const sanitizeFormData = ( data, fields ) => {
  return Object.entries( data ).reduce( ( acc, [ key, value ] ) => {
    const field = fields.find( ( { input } ) => input?.name === key );
    let sanitizedValue;

    if ( ! field || ! field.input ) {
      return acc;
    }

    switch ( field.input.type ) {
      case 'media':
        sanitizedValue = value?.id ?? null;
        break;

      case 'text':
      case 'textarea':
        sanitizedValue = value.trim();
        break;

      default:
        sanitizedValue = value;
    }

    return {
      ...acc,
      [ key ]: sanitizedValue,
    };
  }, {} );
};

export default sanitizeFormData;
