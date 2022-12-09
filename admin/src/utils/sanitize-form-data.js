import get from 'lodash/get';

import { TIME_HHMM_REGEX } from '../constants';

const sanitizeFormData = ( data, prevData, layout ) => {
  const fieldTypes = layout.reduce( ( acc, field ) => {
    if ( ! field?.input ) {
      return acc;
    }

    return {
      ...acc,
      [ field.input.name ]: field.input.type,
    };
  }, {} );

  const sanitizedData = Object.entries( data ).reduce( ( acc, [ key, value ] ) => {
    const type = fieldTypes[ key ];

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

      case 'relation':
        const prevValue = get( prevData, key ) ?? [];
        let connect = [];
        let disconnect = [];

        // Maybe connect relations.
        if ( value?.length ) {
          connect = value
            .filter( relation => {
              const match = prevValue.find( _relation => _relation.id === relation.id );

              // Add if not found in previous data.
              return ! match;
            } )
            .map( ( { id } ) => ( { id } ) );
        }

        // Maybe disconnect relations.
        if ( prevValue?.length ) {
          disconnect = prevValue
            .filter( relation => {
              const match = value.find( _relation => _relation.id === relation.id );

              // Add if found in previous data, but not in next data.
              return ! match;
            } )
            .map( ( { id } ) => ( { id } ) );
        }

        sanitizedValue = { connect, disconnect };
        break;

      case 'string':
      case 'text':
      case 'textarea':
        sanitizedValue = value?.trim() ?? null;
        break;

      case 'time':
        sanitizedValue = value?.match( TIME_HHMM_REGEX ) ? `${value}:00.000` : value;
        break;

      default:
        sanitizedValue = value;
        break;
    }

    return {
      ...acc,
      [ key ]: sanitizedValue,
    };
  }, data );

  return sanitizedData;
};

export default sanitizeFormData;
