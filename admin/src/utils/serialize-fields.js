const defaultGrid = {
  size: {
    col: 12,
  },
};

const serializeFields = ( prefix, index, fields ) => {
  return fields.map( field => {
    const grid = field?.grid ?? defaultGrid;

    return {
      ...field,
      grid,
      input: {
        ...field.input,
        name: `${prefix}[${index}].${field.input.name}`,
      },
    };
  } );
};

export default serializeFields;
