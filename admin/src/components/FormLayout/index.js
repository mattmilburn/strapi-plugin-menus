import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

import { GenericInput, useLibrary } from '@strapi/helper-plugin';
import { Grid, GridItem } from '@strapi/design-system/Grid';

import { InputUID, RelationInputDataManager } from '../../coreComponents';
import { useLazyComponents, useMenuData } from '../../hooks';
import { getFieldError, getFieldName, getRelationValue } from '../../utils';

const FormLayout = ({ fields, gap, schema }) => {
  const { formatMessage } = useIntl();
  const { fields: strapiFields } = useLibrary();
  const { errors, handleChange, modifiedData } = useMenuData();

  const customFieldUids = fields
    .filter(({ input }) => input.type === 'customField')
    .map(({ input }) => input.customField);
  const { isLazyLoading, lazyComponentStore } = useLazyComponents(customFieldUids);

  if (isLazyLoading) {
    return null;
  }

  const customInputs = {
    ...strapiFields,
    ...lazyComponentStore,
    uid: InputUID,
  };

  return (
    <Grid gap={gap}>
      {fields.map((config, i) => {
        const { input, grid } = config;

        // If no input to render, we still try to render the grid cell.
        if (!input) {
          return <GridItem key={i} {...grid} />;
        }

        // Determine default value based on input type.
        let defaultValue = null;

        if (input.type === 'bool') {
          defaultValue = false;
        }

        if (input.type === 'media') {
          defaultValue = [];
        }

        // Cannot use the default value param in the first `get` because we
        // actually want to use the `defaultValue` if we get `null`.
        const fieldName = getFieldName(input.name);
        const fieldError = getFieldError(errors, input.name, fieldName);
        const fieldSchema = get(schema, fieldName, null);
        const fieldType = get(input, 'customField', input.type);
        let fieldValue = get(modifiedData, input.name) ?? defaultValue;

        if (input.type === 'number') {
          fieldValue = Number(fieldValue);
        }

        if (input.type === 'relation') {
          const metadata = fieldSchema?.metadata;

          if (!metadata) {
            console.warn(`Missing metadata for ${fieldName} relation field.`);
            return null;
          }

          return (
            <GridItem key={input.name} {...grid}>
              <RelationInputDataManager
                {...input}
                {...metadata}
                name={input.name} /* Use unsanitized field name here. */
                error={fieldError}
                intlLabel={input?.intlLabel}
                description={input?.description}
                placeholder={input?.placeholder}
                size={grid.col}
                isFieldReadable={true}
                isUserAllowedToEditField={true}
                isUserAllowedToReadField={true}
              />
            </GridItem>
          );
        }

        return (
          <GridItem key={input.name} {...grid}>
            <GenericInput
              {...input}
              attribute={fieldSchema}
              customInputs={customInputs}
              error={fieldError}
              onChange={handleChange}
              value={fieldValue}
              type={fieldType}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

FormLayout.defaultProps = {
  gap: 6,
};

FormLayout.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      input: PropTypes.object,
      grid: PropTypes.object.isRequired,
    })
  ).isRequired,
  gap: PropTypes.number,
  schema: PropTypes.object.isRequired,
};

export default FormLayout;
