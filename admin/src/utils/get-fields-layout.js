import { get, omit } from 'lodash';

const formatString = str => ( {
  id: str,
  defaultMessage: str,
} );

const formatOption = option => {
  const isString = typeof option === 'string';
  const isCustom = ! isString && !! option?.label && !! option?.value;
  let label, value;

  // String option (raw values).
  if ( isString ) {
    label = option;
    value = option;
  }

  // Custom option with `label` and `value`.
  if ( isCustom ) {
    label = option.label;
    value = option.value;
  }

  // Must be a mandatory field from the plugin with options already formatted.
  if ( ! isString && ! isCustom ) {
    return option;
  }

  return {
    key: value,
    value,
    metadatas: {
      intlLabel: {
        id: label,
        defaultMessage: label,
      },
    },
  };
};

const normalizeField = ( field, schema ) => {
  if ( ! field?.input ) {
    return field;
  }

  const name = get( field, 'input.name' );
  const type = get( field, 'input.type' );
  const label = get( field, 'input.label' );
  const placeholder = get( field, 'input.placeholder' );
  const description = get( field, 'input.description' );
  const defaultOptions = get( schema, `menuItem.${name}.enum`, [] );
  const options = get( field, 'input.options', defaultOptions );

  // We don't want the `label` prop for the rendered input component.
  let input = omit( field.input, 'label' );

  // Replace `label` prop in custom config with formatted object.
  if ( label ) {
    input.intlLabel = formatString( label );
  }

  // Replace `placeholder` prop in custom config with formatted object.
  if ( typeof placeholder === 'string' ) {
    input.placeholder = formatString( placeholder );
  }

  // Replace `description` prop in custom config with formatted object.
  if ( typeof description === 'string' ) {
    input.description = formatString( description );
  }

  // Replace `options` props in custom config with `metadatas`, `key`, and `value` object.
  if ( type === 'select' ) {
    input.options = options.map( formatOption );
  }

  return {
    ...field,
    input,
  };
};

const getFieldsLayout = ( defaultLayout, customLayouts, schema ) => {
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
    layouts[ key ] = layouts[ key ].map( field => normalizeField( field, schema ) );
  } );

  return layouts;
};

export default getFieldsLayout;
