const getFieldName = (namePath) => {
  if (namePath.indexOf('.') !== -1) {
    return namePath.split('.').slice(1).join('');
  }

  return namePath;
};

export default getFieldName;
