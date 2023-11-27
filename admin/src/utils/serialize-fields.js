export const defaultGridProps = {
  col: 12,
};

const serializeFields = (prefix, index, fields) => {
  return fields.map((field) => {
    const grid = field?.grid ?? defaultGridProps;

    return {
      ...field,
      grid,
      input: {
        ...field.input,
        name: `${prefix}[${index}].${field.input.name}`,
      },
    };
  });
};

export default serializeFields;
