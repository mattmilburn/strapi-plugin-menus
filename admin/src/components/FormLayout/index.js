import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import get from "lodash/get";

import { GenericInput, useCustomFields, useLibrary } from "@strapi/helper-plugin";
import { Grid, GridItem } from "@strapi/design-system/Grid";

import { InputUID, RelationInputDataManager } from "../../coreComponents";
import { useMenuData } from "../../hooks";
import { getFieldError, getFieldName, getRelationValue } from "../../utils";

const FormLayout = ({ fields, gap, schema }) => {
  const { formatMessage } = useIntl();
  const customFields = useCustomFields();
  const { fields: strapiFields } = useLibrary();
  const { errors, handleChange, modifiedData } = useMenuData();

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

        if (input.type === "bool") {
          defaultValue = false;
        }

        if (input.type === "media") {
          defaultValue = [];
        }

        // Cannot use the default value param in the first `get` because we
        // actually want to use the `defaultValue` if we get `null`.
        const fieldName = getFieldName(input.name);
        const fieldError = getFieldError(errors, input.name, fieldName);
        const fieldSchema = get(schema, fieldName, null);
        let fieldValue = get(modifiedData, input.name) ?? defaultValue;

        if (input.type === "number") {
          fieldValue = Number(fieldValue);
        }

        if (input.type === "relation") {
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

        if (input.type === "customField") {
          const customField = customFields.get(input.customField);
          const CustomFieldInput = React.lazy(customField.components.Input);

          return (
            <GridItem key={input.name} {...grid}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <CustomFieldInput
                  {...input}
                  attribute={fieldSchema}
                  error={fieldError}
                  value={fieldValue}
                  onChange={handleChange}
                />
              </React.Suspense>
            </GridItem>
          );
        }

        return (
          <GridItem key={input.name} {...grid}>
            <GenericInput
              {...input}
              attribute={fieldSchema}
              error={fieldError}
              value={fieldValue}
              onChange={handleChange}
              customInputs={{
                ...strapiFields,
                uid: InputUID
              }}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

FormLayout.defaultProps = {
  gap: 6
};

FormLayout.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      input: PropTypes.object,
      grid: PropTypes.object.isRequired
    })
  ).isRequired,
  gap: PropTypes.number,
  schema: PropTypes.object.isRequired
};

export default FormLayout;
