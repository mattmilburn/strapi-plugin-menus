import { get, omit } from 'lodash';

const normalizeField = field => {
  if ( ! field?.input ) {
    return field;
  }

  const label = get( field, 'input.label' );
  const placeholder = get( field, 'input.placeholder' );
  const description = get( field, 'input.description' );
  const options = get( field, 'input.options' );

  // We don't want the `label` prop for the rendered input component.
  let input = omit( field.input, 'label' );

  // Replace `label` props in custom config with formatted object.
  if ( label ) {
    input.intlLabel = {
      id: label,
      defaultMessage: label,
    };
  }

  // Replace `placeholder` props in custom config with formatted object.
  if ( typeof placeholder === 'string' ) {
    input.placeholder = {
      id: placeholder,
      defaultMessage: placeholder,
    };
  }

  // Replace `description` props in custom config with formatted object.
  if ( typeof description === 'string' ) {
    input.description = {
      id: description,
      defaultMessage: description,
    };
  }

  // Replace `options` props in custom config with `metadatas`, `key`, and `value` object.
  if ( options ) {
    input.options = options.map( option => {
      const optionLabel = get( option, 'label' );
      const optionValue = get( option, 'value' );

      // A `label` prop indicates a simpler config that needs extra data.
      if ( ! optionLabel ) {
        return option;
      }

      return {
        metadatas: {
          intlLabel: {
            id: optionLabel,
            defaultMessage: optionLabel,
          },
        },
        key: optionValue,
        value: optionValue,
      };
    } );
  }

  return {
    ...field,
    input,
  };
};

const normalizeItemFields = ( defaultLayout, customLayouts ) => {
  // Combine custom layouts with default layout.
  let layouts = {
    link: [
      ...defaultLayout,
      ...get( customLayouts, 'link', [] ),
    ],
    ...omit( customLayouts, 'link' ),
  };

  // Normalize fields so their simpler config props adapt to the actual component props.
  Object.keys( layouts ).forEach( key => {
    layouts[ key ] = layouts[ key ].map( normalizeField );
  } );

  return layouts;
};

export default normalizeItemFields;
