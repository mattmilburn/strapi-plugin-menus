import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

import { GenericInput, useCustomFields, useLibrary } from '@strapi/helper-plugin';
import { Grid, GridItem } from '@strapi/design-system/Grid';

import { InputUID, RelationInputDataManager } from '../../coreComponents';
import { useMenuData } from '../../hooks';

const FormLayout = ( { fields, gap } ) => {
  const { formatMessage } = useIntl();
  const customFields = useCustomFields();
  const { fields: strapiFields } = useLibrary();
  const {
    errors,
    handleChange,
    isCreatingEntry,
    modifiedData,
    schema,
  } = useMenuData();

  const getFieldName = name => {
    if ( name.indexOf( '.' ) !== -1 ) {
      return name.split( '.' ).slice( 1 ).join( '' );
    }

    return name;
  };

  const getFieldError = ( name, label ) => {
    const msg = get( errors, name, null );

    // Ensure that repeatable items remove the array bracket notation from the error.
    if ( typeof msg === 'string' ) {
      return msg.replace( name, label );
    }

    return msg;
  };

  return (
    <Grid gap={ gap }>
      { fields.map( ( config, i ) => {
        const { input, grid } = config;

        // If no input to render, we still try to render the grid cell.
        if ( ! input ) {
          return <GridItem key={ i } { ...grid } />;
        }

        // Determine default value based on input type.
        let defaultValue = null;

        if ( input.type === 'bool' ) {
          defaultValue = false;
        }

        if ( input.type === 'media' ) {
          defaultValue = [];
        }

        // Cannot use the default value param in the first `get` because we
        // actually want to use the `defaultValue` if we get `null`.
        const fieldName = getFieldName( input.name );
        const fieldError = getFieldError( input.name, fieldName );
        let fieldValue = get( modifiedData, input.name ) ?? defaultValue;

        if ( input.type === 'number' ) {
          fieldValue = Number( fieldValue );
        }

        if ( input.type === 'relation' ) {
          const metadata = schema.menuItem[ fieldName ]?.metadata;

          if ( ! metadata ) {
            console.warn( `Missing metadata for ${fieldName} relation field.` );
            return null;
          }

          return (
            <GridItem key={ input.name } { ...grid }>
              <RelationInputDataManager
                { ...input }
                { ...metadata }
                name={ fieldName }
                value={ fieldValue }
                error={ fieldError }
                intlLabel={ input?.intlLabel }
                description={ input?.description }
                placeholder={ input?.placeholder }
                size={ grid.col }
                isCreatingEntry={ isCreatingEntry }
                isFieldReadable={ true }
                isUserAllowedToEditField={ true }
                isUserAllowedToReadField={ true }
              />
            </GridItem>
          );
        }

        if ( input.type === 'customField' ) {
          const customField = customFields.get( input.customField );
          const CustomFieldInput = React.lazy( customField.components.Input );

          return (
            <GridItem key={ input.name } { ...grid }>
              <CustomFieldInput
                { ...input }
                attribute={ schema.menuItem[ fieldName ] }
                value={ fieldValue }
                error={ fieldError }
                onChange={ handleChange }
              />
            </GridItem>
          );
        }

        return (
          <GridItem key={ input.name } { ...grid }>
            <GenericInput
              { ...input }
              value={ fieldValue }
              error={ fieldError }
              onChange={ handleChange }
              customInputs={ {
                ...strapiFields,
                uid: InputUID,
              } }
            />
          </GridItem>
        );
      } ) }
    </Grid>
  );
};

FormLayout.defaultProps = {
  gap: 6,
};

FormLayout.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape( {
      input: PropTypes.object,
      grid: PropTypes.object.isRequired,
    } )
  ).isRequired,
  gap: PropTypes.number,
};

export default FormLayout;
