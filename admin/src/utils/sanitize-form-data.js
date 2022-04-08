import { TIME_HHMM_REGEX } from '../constants';

const sanitizeFormData = ( data, layout ) => {
  const fields = layout.reduce( ( acc, field ) => {
    if ( ! field?.input ) {
      return acc;
    }

    return {
      ...acc,
      [ field.input.name ]: field.input.type,
    };
  }, {} );

  const sanitizedData = Object.entries( data ).reduce( ( acc, [ key, value ] ) => {
    const type = fields[ key ];

    if ( ! type ) {
      return acc;
    }

    let sanitizedValue;

    switch ( type ) {
      case 'bool':
        sanitizedValue = value === null ? null : !! value;
        break;

      case 'date':
      case 'datetime':
        sanitizedValue = value ? new Date( value ) : null;
        break;

      case 'media':
        sanitizedValue = value?.id ?? null;
        break;

      case 'number':
        sanitizedValue = value !== null ? Number( value ) : null;
        break;

      case 'string':
      case 'text':
      case 'textarea':
        sanitizedValue = value?.trim() ?? null;
        break;

      case 'time':
        if ( value.match( TIME_HHMM_REGEX )  ) {
          sanitizedValue = `${value}:00.000`;
        }
        break;

      default:
        sanitizedValue = value;
    }

    return {
      ...acc,
      [ key ]: sanitizedValue,
    };
  }, data );

  return sanitizedData;
};

export default sanitizeFormData;
